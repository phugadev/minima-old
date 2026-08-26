/**
 * Minima — contrast audit
 *
 * Charter Article 8 defines contrast floors and says a change that drops any
 * pairing below its floor is not shipped. This is the runner for that rule.
 * A rule with no runner decays.
 *
 * Usage:
 *   npm run audit                     # against http://localhost:3000
 *   node scripts/audit-contrast.mjs --url https://minima.example
 *   node scripts/audit-contrast.mjs --json
 *
 * Exit codes:  0 all floors hold · 1 a floor was breached · 2 could not run
 *
 * Why a browser: the tokens are OKLCH behind chains of var(), and the values
 * are deliberately outside sRGB. Resolving them by hand would be re-deriving
 * gamut mapping; the engine already knows the answer. Playwright is the
 * cheapest way to ask it.
 */

import { chromium } from "playwright"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const URL = flag("url", "http://localhost:3000")
const AS_JSON = args.includes("--json")

/* ── The floors, straight from Charter Article 8 ──────────────────────────
   `bg: "*"` expands to both canvas and surface, because a token that only
   passes on one of them fails the moment a component moves.               */
const CHECKS = [
  { clause: "8.1", label: "foreground",        fg: "foreground",         bg: "*", floor: 7 },
  { clause: "8.1", label: "muted-foreground",  fg: "muted-foreground",   bg: "*", floor: 4.5 },
  { clause: "8.1", label: "subtle-foreground", fg: "subtle-foreground",  bg: "*", floor: 3 },
  { clause: "8.1", label: "prose-body",        fg: "prose-body",         bg: "*", floor: 4.5 },
  { clause: "8.1", label: "prose-strong",      fg: "prose-strong",       bg: "*", floor: 7 },
  { clause: "8.1", label: "accent-hue-text",   fg: "accent-hue-text",    bg: "*", floor: 4.5 },
  { clause: "8.1", label: "code-foreground",   fg: "code-foreground",    bg: "code-bg", floor: 7 },

  /* Structural contrast needs a floor exactly as much as text does — 8.3. */
  { clause: "8.1", label: "border",            fg: "border",             bg: "*", floor: 1.15 },
  { clause: "8.1", label: "fill",              fg: "fill",               bg: "*", floor: 1.06 },
]

/* State text always sits on its own subtle fill, never on the page. */
for (const tone of ["success", "warning", "danger", "info"]) {
  CHECKS.push({
    clause: "8.1",
    label: `${tone}-text on ${tone}-subtle`,
    fg: `${tone}-text`,
    bg: `${tone}-subtle`,
    floor: 4.5,
  })
  CHECKS.push({
    clause: "8.1",
    label: `${tone}-foreground on ${tone}`,
    fg: `${tone}-foreground`,
    bg: tone,
    floor: 4.5,
  })
}

/* A data mark is judged against the surface behind it. */
for (let i = 1; i <= 6; i++) {
  CHECKS.push({
    clause: "8.1",
    label: `chart-${i}`,
    fg: `chart-${i}`,
    bg: "*",
    floor: 3,
  })
}

/* Every theme × look combination. The fill-on-canvas regression that
   produced 8.3 was only visible in light/raised. */
const MODES = [
  { theme: "light", surface: "raised" },
  { theme: "light", surface: "flat" },
  { theme: "dark", surface: "raised" },
  { theme: "dark", surface: "flat" },
]

/** Resolve every token to sRGB in the page, then composite and compare here. */
async function readTokens(page, tokens) {
  return page.evaluate((names) => {
    const cv = document.createElement("canvas")
    cv.width = cv.height = 1
    const ctx = cv.getContext("2d", { willReadFrequently: true })
    const el = document.createElement("div")
    document.body.appendChild(el)

    const out = {}
    for (const name of names) {
      /* A token that does not exist resolves to nothing and would silently
         read as transparent black — which looks like a passing contrast
         against a light background. Catch it as an error instead. */
      const declared = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${name}`)
        .trim()
      el.style.color = ""
      el.style.color = `var(--${name})`
      const resolved = getComputedStyle(el).color
      if (!declared || !resolved) {
        out[name] = { missing: true }
        continue
      }
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = resolved
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      out[name] = { rgb: [d[0], d[1], d[2]], a: d[3] / 255 }
    }
    el.remove()
    return out
  }, tokens)
}

const srgb = (c) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]) =>
  0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)

/** Composite a possibly-translucent token over its opaque background. */
const over = (fg, bg) =>
  fg.a >= 1 ? fg.rgb : fg.rgb.map((c, i) => c * fg.a + bg.rgb[i] * (1 - fg.a))

const ratio = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const main = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 20000 })
  } catch {
    await browser.close()
    console.error(
      `\n  Could not reach ${URL}\n` +
        `  Start the app first (npm run dev), or pass --url.\n`
    )
    process.exit(2)
  }
  await page.waitForTimeout(1200)

  const tokens = [
    ...new Set(
      CHECKS.flatMap((c) => [c.fg, c.bg === "*" ? null : c.bg]).filter(Boolean)
    ),
    "canvas",
    "surface",
  ]

  const results = []
  const missing = new Set()

  for (const mode of MODES) {
    await page.evaluate(({ theme, surface }) => {
      document.documentElement.classList.toggle("dark", theme === "dark")
      document.documentElement.dataset.surface = surface
    }, mode)
    await page.waitForTimeout(150)

    const v = await readTokens(page, tokens)
    for (const t of tokens) if (v[t]?.missing) missing.add(t)

    for (const check of CHECKS) {
      const backgrounds = check.bg === "*" ? ["canvas", "surface"] : [check.bg]
      for (const bgName of backgrounds) {
        const fg = v[check.fg]
        const bg = v[bgName]
        if (fg?.missing || bg?.missing) continue
        const value = ratio(luminance(over(fg, bg)), luminance(bg.rgb))
        results.push({
          ...mode,
          clause: check.clause,
          label: check.label,
          against: bgName,
          floor: check.floor,
          value,
          pass: value >= check.floor,
        })
      }
    }
  }

  await browser.close()

  const failures = results.filter((r) => !r.pass)

  if (AS_JSON) {
    console.log(
      JSON.stringify(
        { url: URL, missing: [...missing], results, failures: failures.length },
        null,
        2
      )
    )
  } else {
    for (const mode of MODES) {
      const rows = results.filter(
        (r) => r.theme === mode.theme && r.surface === mode.surface
      )
      const bad = rows.filter((r) => !r.pass)
      const head = `${mode.theme}/${mode.surface}`.padEnd(14)
      console.log(
        `\n  ${head} ${bad.length ? `${bad.length} breach(es)` : `${rows.length} pairings, all floors hold`}`
      )
      for (const r of bad) {
        console.log(
          `      ${r.label} on ${r.against}`.padEnd(46) +
            `${r.value.toFixed(2)} < ${r.floor}   Charter ${r.clause}`
        )
      }
    }

    if (missing.size) {
      console.log(`\n  Undefined tokens (not audited): ${[...missing].join(", ")}`)
    }
    console.log(
      failures.length
        ? `\n  FAIL — ${failures.length} pairing(s) below floor. Charter 8.2: this does not ship.\n`
        : `\n  PASS — ${results.length} pairings across ${MODES.length} modes, every Article 8 floor holds.\n`
    )
  }

  /* An undefined token is a broken audit, not a passing one. */
  process.exit(failures.length || missing.size ? 1 : 0)
}

main()
