/**
 * Minima — colour scale generator
 *
 * Emits `src/app/scales.css`: thirteen 12-step ramps in OKLCH, light and dark.
 *
 * Step semantics are Radix's, adopted verbatim so the vocabulary matches what
 * the rest of the ecosystem already means by a step number:
 *
 *    1  app background          7  element border / focus ring
 *    2  subtle background       8  hovered element border
 *    3  element background      9  SOLID
 *    4  hovered element bg     10  hovered solid
 *    5  active / selected bg   11  low-contrast text  (>= 4.5:1 on 1/2)
 *    6  subtle border          12  high-contrast text
 *
 * Why OKLCH: lightness is perceptual, so a step number weighs the same in
 * every hue. Values are unclamped, so saturated steps render wide on a P3
 * display and are gamut-mapped down elsewhere — one palette, two gamuts.
 *
 * Run: node scripts/generate-scales.mjs
 */

import { writeFileSync } from "node:fs"

export const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

/* Lightness tracks. Chromatic hues and gray differ at the ends: gray has to
   reach true text-black, chromatic hues must not. */
export const L_LIGHT = [
  0.993, 0.977, 0.955, 0.936, 0.914, 0.886, 0.848, 0.790, 0.600, 0.552, 0.505, 0.360,
]
export const L_DARK = [
  0.155, 0.195, 0.245, 0.280, 0.315, 0.360, 0.420, 0.510, 0.620, 0.680, 0.780, 0.925,
]

export const L_GRAY_LIGHT = [
  0.993, 0.980, 0.956, 0.938, 0.918, 0.892, 0.858, 0.795, 0.640, 0.590, 0.520, 0.180,
]
export const L_GRAY_DARK = [
  0.145, 0.185, 0.225, 0.255, 0.285, 0.325, 0.375, 0.455, 0.600, 0.660, 0.770, 0.960,
]

/* Relative chroma per step — near-zero at the page backgrounds, peaking at
   the solid, easing back for text so coloured text never turns garish. */
export const C_LIGHT = [
  0.05, 0.10, 0.18, 0.26, 0.34, 0.42, 0.52, 0.68, 1.00, 0.98, 0.92, 0.62,
]
export const C_DARK = [
  0.10, 0.16, 0.26, 0.34, 0.42, 0.50, 0.60, 0.76, 1.00, 0.96, 0.82, 0.55,
]

/* Lightness bias applies to the solid steps only (9, 10).
   A hue cannot stay itself at an arbitrary lightness — amber at blue's
   lightness is brown. Radix's own step 9 varies in lightness by hue for
   exactly this reason. Steps 11/12 take no bias, so accessible amber text
   is — correctly — brown. */
export const BIAS_WEIGHT = [0, 0, 0, 0, 0, 0, 0, 0.2, 1, 1, 0, 0]

/**
 * hue     OKLCH hue angle
 * cMax    peak chroma at step 9. Deliberately past the sRGB boundary for
 *         several hues: on a P3 display these render wide and vivid, and
 *         the browser gamut-maps them down on an sRGB one.
 * lPeak   the lightness at which the hue can actually hold cMax
 * lBias   lightness added at the solid steps (see BIAS_WEIGHT)
 *
 * The text colour for steps 9/10 is NOT declared here — it is computed from
 * the resulting solid by pickOnSolid(), because a hand-set flag is exactly
 * the kind of thing that silently stops being true when a curve is retuned.
 */
export const HUES = [
  { name: "red",    hue:  25, cMax: 0.225, lPeak: 0.58, lBias: -0.07  },
  { name: "orange", hue:  50, cMax: 0.200, lPeak: 0.68, lBias:  0.07, onSolid: "dark"  },
  { name: "amber",  hue:  78, cMax: 0.180, lPeak: 0.80, lBias:  0.16, onSolid: "dark"  },
  { name: "yellow", hue:  99, cMax: 0.175, lPeak: 0.88, lBias:  0.22, onSolid: "dark"  },
  { name: "lime",   hue: 130, cMax: 0.210, lPeak: 0.84, lBias:  0.18, onSolid: "dark"  },
  { name: "green",  hue: 150, cMax: 0.215, lPeak: 0.72, lBias:  0.07, onSolid: "dark"  },
  { name: "teal",   hue: 180, cMax: 0.165, lPeak: 0.74, lBias:  0.06, onSolid: "dark"  },
  { name: "cyan",   hue: 225, cMax: 0.175, lPeak: 0.70, lBias:  0.03 },
  { name: "blue",   hue: 258, cMax: 0.245, lPeak: 0.56, lBias: -0.01 },
  { name: "indigo", hue: 277, cMax: 0.250, lPeak: 0.52, lBias: -0.02 },
  { name: "purple", hue: 302, cMax: 0.265, lPeak: 0.55, lBias:  0.00 },
  { name: "pink",   hue: 353, cMax: 0.245, lPeak: 0.62, lBias:  0.02 },
]

/* How much chroma a hue can carry at a given lightness. A broad gaussian
   around the hue's peak: keeps pale steps clean and dark steps from clipping
   into mud, without flattening the mid-range. */
const holdable = (l, lPeak) => Math.exp(-(((l - lPeak) / 0.50) ** 2))

/* ── Self-checking ─────────────────────────────────────────────────────────
   OKLCh → linear sRGB → WCAG relative luminance, so the generator can verify
   its own contrast rather than emitting a palette and hoping. Out-of-gamut
   values are clamped here, which is cruder than the browser's gamut mapping —
   so the threshold below carries headroom, and scripts/audit-contrast.mjs
   remains the authority. */
function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, sC = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * sC,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * sC,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * sC,
  ].map((v) => Math.min(1, Math.max(0, v)))
}

const relLuminance = (L, C, h) => {
  const [r, g, b] = oklchToLinearSrgb(L, C, h)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/* The two candidates for text sitting on a solid. */
const ON_SOLID = {
  light: { css: "oklch(1 0 0)", lum: 1 },
  dark: { css: "oklch(0.18 0 0)", lum: relLuminance(0.18, 0, 0) },
}

/* Charter 8.1 floor for text, plus headroom for the clamping above. */
const ON_SOLID_FLOOR = 4.5
const ON_SOLID_MARGIN = 0.35

/* The hues the semantic layer actually pairs with text, via {tone}-foreground.
   Only these carry the AA guarantee, and the generator refuses to emit a
   palette that breaks it.

   The others are deliberately exempt. A saturated hue around L 0.60 sits in a
   dead zone where neither white nor near-black reaches 4.5:1 — that is a
   property of colour, not a bug — and forcing every hue out of it would cost
   the whole palette its punch to protect a pairing Minima never makes. Blue,
   indigo, purple and pink are used as links, rings, tints and data marks;
   none of those put small text on a step 9 fill. */
const TEXT_BEARING = new Set(["green", "amber", "red", "cyan"])

/**
 * Pick the readable text colour for a hue's solid step, by measurement rather
 * than by taste. Throws if neither candidate clears the floor: a palette that
 * cannot carry a legible button label is not one Minima ships (Charter 8.2).
 */
function pickOnSolid(hue, lTrack, cTrack, biasScale) {
  const i = STEPS.indexOf(9)
  const scale = (hue.lBias ?? 0) > 0 ? biasScale : 1
  const l = Math.min(0.99, Math.max(0.02, lTrack[i] + (hue.lBias ?? 0) * BIAS_WEIGHT[i] * scale))
  const c = hue.cMax * cTrack[i] * holdable(l, hue.lPeak)
  const solid = relLuminance(l, c, hue.hue)

  const scored = Object.entries(ON_SOLID)
    .map(([k, v]) => ({ key: k, css: v.css, ratio: contrast(v.lum, solid) }))
    .sort((a, b) => b.ratio - a.ratio)

  const best = scored[0]
  if (TEXT_BEARING.has(hue.name) && best.ratio < ON_SOLID_FLOOR + ON_SOLID_MARGIN) {
    throw new Error(
      `${hue.name}: step 9 cannot carry legible text — best is ${best.key} at ` +
        `${best.ratio.toFixed(2)}:1, floor is ${ON_SOLID_FLOOR}. ` +
        `Lower its lBias or cMax until it clears. (Charter 8.1)`
    )
  }
  return best
}

const r3 = (n) => Number(n.toFixed(3))
const r4 = (n) => Number(n.toFixed(4))

export function ramp({ hue, cMax, lPeak, lBias = 0 }, lTrack, cTrack, biasScale = 1) {
  return lTrack.map((l0, i) => {
        /* The dark-mode scale softens the LIGHTENING of warm hues, whose solids
       already sit high on the dark track. A hue biased downward is being
       deepened to stay legible under text, and needs no softening. */
    const scale = lBias > 0 ? biasScale : 1
    const l = Math.min(0.99, Math.max(0.02, l0 + lBias * BIAS_WEIGHT[i] * scale))
    const c = cMax * cTrack[i] * holdable(l, lPeak)
    return `oklch(${r3(l)} ${r4(c)} ${hue})`
  })
}

export function grayRamp(lTrack) {
  return lTrack.map((l) => `oklch(${r3(l)} 0 0)`)
}

/** Every ramp value for one mode, as a flat `{ "gray-1": "oklch(…)" }` map. */
export function rampVars(mode) {
  const light = mode === "light"
  /* Dark solids sit higher on the lightness track already, so they need less
     of the warm-hue bias than light solids do. */
  const biasScale = light ? 1 : 0.6
  const vars = {}
  grayRamp(light ? L_GRAY_LIGHT : L_GRAY_DARK).forEach((v, i) => {
    vars[`gray-${STEPS[i]}`] = v
  })
  for (const h of HUES) {
    ramp(h, light ? L_LIGHT : L_DARK, light ? C_LIGHT : C_DARK, biasScale).forEach(
      (v, i) => {
        vars[`${h.name}-${STEPS[i]}`] = v
      }
    )
    vars[`${h.name}-on-solid`] = pickOnSolid(
      h,
      light ? L_LIGHT : L_DARK,
      light ? C_LIGHT : C_DARK,
      biasScale
    ).css
  }
  return vars
}

const STEP_LABEL = {
  1: "app background",
  2: "subtle background",
  3: "element background",
  4: "hovered element background",
  5: "active / selected background",
  6: "subtle border",
  7: "element border / focus ring",
  8: "hovered element border",
  9: "SOLID",
  10: "hovered solid",
  11: "low-contrast text",
  12: "high-contrast text",
}

function block(mode) {
  const vars = rampVars(mode)
  const names = ["gray", ...HUES.map((h) => h.name)]
  const lines = []

  for (const name of names) {
    lines.push(
      `  /* ── ${name} ${"─".repeat(Math.max(0, 64 - name.length))} */`
    )
    for (const s of STEPS) {
      const key = `${name}-${s}`
      lines.push(`  --${key}:${" ".repeat(Math.max(1, 14 - key.length))}${vars[key]};`)
    }
    if (name !== "gray") {
      lines.push(`  --${name}-on-solid: ${vars[`${name}-on-solid`]};`)
    }
    lines.push("")
  }
  return lines.join("\n").trimEnd()
}

const legend = STEPS.map(
  (s) => `     ${String(s).padStart(2)}  ${STEP_LABEL[s]}`
).join("\n")

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = `/* ═══════════════════════════════════════════════════════════════════════════
     MINIMA — SPECTRAL RAMP
     GENERATED FILE — edit scripts/generate-scales.mjs and re-run:
         node scripts/generate-scales.mjs

     Thirteen ramps × twelve steps, in OKLCH. Step semantics are Radix's,
     adopted verbatim rather than invented:

  ${legend}

     Steps 1–8 and 11–12 sit on a shared lightness track, so a border or a text
     colour weighs the same in every hue. Steps 9–10 carry a per-hue lightness
     bias, because amber at blue's lightness is brown.

     This is raw material, not a licence. Minima stays neutral-dominant: the
     spectral ramps exist so that the state, identity and data tokens have
     somewhere principled to come from. Reaching past those tokens into a raw
     ramp is the exception, and it should feel like one.
     ═══════════════════════════════════════════════════════════════════════════ */

  :root {
  ${block("light")}
  }

  .dark {
  ${block("dark")}
  }
  `

  writeFileSync(new URL("../src/app/scales.css", import.meta.url), out)
  console.log(
    `wrote src/app/scales.css — ${HUES.length + 1} ramps × ${STEPS.length} steps`
  )
}
