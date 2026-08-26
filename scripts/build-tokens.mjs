/**
 * Minima — token composer
 *
 * The single source of truth for everything below the component layer.
 * Emits BOTH:
 *   src/app/tokens.css   the app's token layer
 *   registry.json        the same tokens, for consumers of the registry
 *
 * That is the point: before this file existed the semantic layer lived twice
 * and could drift. Now the CSS and the registry are two renderings of one
 * object graph. Hand-editing either output is a bug.
 *
 * Run: node scripts/build-tokens.mjs
 */

import { writeFileSync } from "node:fs"

import { rampVars, HUES, STEPS } from "./generate-scales.mjs"

/** GitHub-hosted registry: <owner>/<repo> is the whole address. */
const OWNER = "phugadev"
const REPO = "minima"

const HUE_NAMES = ["gray", ...HUES.map((h) => h.name)]

/* ── Semantic layer ─────────────────────────────────────────────────────────
   Mode-independent by construction: every value is a ramp step, so both
   themes read these exact lines and only the ramps beneath them change.
   A literal colour value in here is a bug.                                   */
const SEMANTIC = {
  radius: "0.375rem",

  /* Text. 11 and 12 are the scale's text steps. The third level for meta is
     sourced from step 10 — a documented Minima extension, never body copy. */
  foreground: "var(--gray-12)",
  "muted-foreground": "var(--gray-11)",
  "subtle-foreground": "var(--gray-10)",

  /* Neutral fills — element / hover / active */
  fill: "var(--gray-3)",
  "fill-hover": "var(--gray-4)",
  "fill-active": "var(--gray-5)",
  muted: "var(--fill)",
  secondary: "var(--fill)",
  "secondary-foreground": "var(--gray-12)",
  accent: "var(--fill-hover)",
  "accent-foreground": "var(--gray-12)",

  /* Lines — subtle / element / hovered */
  border: "var(--gray-6)",
  "border-strong": "var(--gray-7)",
  "border-active": "var(--gray-8)",
  input: "var(--gray-7)",

  background: "var(--canvas)",
  card: "var(--surface)",
  "card-foreground": "var(--foreground)",
  popover: "var(--surface)",
  "popover-foreground": "var(--foreground)",

  primary: "var(--gray-12)",
  "primary-foreground": "var(--gray-1)",

  destructive: "var(--danger)",
  "destructive-foreground": "var(--danger-foreground)",

  "accent-hue": "var(--blue-9)",
  "accent-hue-text": "var(--blue-11)",
  "accent-hue-subtle": "var(--blue-3)",
  "accent-hue-border": "var(--blue-6)",
  ring: "var(--blue-9)",

  /* Code — one treatment, used in both registers. Code is never coloured by
     Minima: syntax highlighting is a product concern, and a system that tints
     code has quietly spent colour on a fourth job. */
  "code-foreground": "var(--foreground)",
  "code-bg": "var(--fill)",
  "code-border": "var(--border)",

  /* Interaction states that every component would otherwise reinvent. */
  "disabled-opacity": "0.5",
  "scrollbar-thumb": "var(--border-active)",
  "scrollbar-thumb-hover": "var(--subtle-foreground)",

  /* Prose — body sits at the muted level so a page of text never shouts;
     bold jumps to maximum contrast, so emphasis is the thing that does. */
  "prose-body": "var(--muted-foreground)",
  "prose-strong": "var(--foreground)",
  "prose-heading": "var(--foreground)",
  "prose-link": "var(--accent-hue-text)",
  "prose-code": "var(--code-foreground)",
  "prose-marker": "var(--subtle-foreground)",

  sidebar: "var(--surface)",
  "sidebar-foreground": "var(--foreground)",
  "sidebar-primary": "var(--gray-12)",
  "sidebar-primary-foreground": "var(--gray-1)",
  "sidebar-accent": "var(--fill-hover)",
  "sidebar-accent-foreground": "var(--foreground)",
  "sidebar-border": "var(--border)",
  "sidebar-ring": "var(--ring)",
}

/* State tones: solid 9, hover 10, subtle 3, border 6, text 11. */
const TONES = {
  success: "green",
  warning: "amber",
  danger: "red",
  info: "cyan",
}
for (const [tone, hue] of Object.entries(TONES)) {
  Object.assign(SEMANTIC, {
    [tone]: `var(--${hue}-9)`,
    [`${tone}-hover`]: `var(--${hue}-10)`,
    [`${tone}-foreground`]: `var(--${hue}-on-solid)`,
    [`${tone}-text`]: `var(--${hue}-11)`,
    [`${tone}-subtle`]: `var(--${hue}-3)`,
    [`${tone}-border`]: `var(--${hue}-6)`,
  })
}

/* ── Data ───────────────────────────────────────────────────────────────────
   The one job that is genuinely mode-dependent. A series mark needs >= 3:1
   against its surface, and no single step delivers that in both themes:
   step 9 is vivid on near-black and washes out on white. Amber proves it —
   at step 10 it measures 2.56:1 on a light surface.

   So light uses step 11, whose contract is >= 4.5:1 against steps 1/2, and
   dark uses step 9. This is the payoff of adopting Radix's semantics rather
   than inventing our own: the floor is a property of the step, not something
   re-measured per hue.                                                       */
const CHART_HUES = ["blue", "teal", "purple", "amber", "pink", "gray"]
const chartVars = (step) =>
  Object.fromEntries(
    CHART_HUES.map((h, i) => [`chart-${i + 1}`, `var(--${h}-${step})`])
  )

/* ── Canvas & surface ───────────────────────────────────────────────────── */
const CANVAS_LIGHT = {
  canvas: "var(--gray-2)",
  surface: "var(--gray-1)",
  "elevation-xs": "0 1px 2px 0 oklch(0 0 0 / 0.04)",
  "elevation-sm": "0 1px 2px 0 oklch(0 0 0 / 0.05), 0 1px 3px 0 oklch(0 0 0 / 0.04)",
  "elevation-md": "0 2px 4px -1px oklch(0 0 0 / 0.05), 0 4px 12px -2px oklch(0 0 0 / 0.06)",
  "elevation-lg": "0 8px 24px -4px oklch(0 0 0 / 0.08), 0 2px 6px -2px oklch(0 0 0 / 0.05)",
}

const CANVAS_DARK = {
  canvas: "var(--gray-1)",
  surface: "var(--gray-2)",
  "elevation-xs": "0 1px 2px 0 oklch(0 0 0 / 0.4)",
  "elevation-sm": "0 1px 2px 0 oklch(0 0 0 / 0.5), 0 1px 3px 0 oklch(0 0 0 / 0.4)",
  "elevation-md": "0 2px 4px -1px oklch(0 0 0 / 0.5), 0 4px 12px -2px oklch(0 0 0 / 0.5)",
  "elevation-lg": "0 8px 24px -4px oklch(0 0 0 / 0.6), 0 2px 6px -2px oklch(0 0 0 / 0.5)",
}

/* ── Density ────────────────────────────────────────────────────────────────
   Spacing inherits Tailwind's 4px rhythm. What Minima adds is control
   geometry and three rhythm tokens, so density is one attribute rather than
   a thousand call-site decisions.

   The ladder is strictly 2x at every rung — gutter, stack, section. A gap
   between groups must be at least twice the gap inside one, or the grouping
   stops reading as grouping. Holding the ratio at exactly 2 makes that
   legible at every density.                                                  */
const DENSITY = {
  default: {
    "control-xs": "1.5rem",
    "control-sm": "1.75rem",
    "control-md": "2rem",
    "control-lg": "2.25rem",
    gutter: "1rem",     /* 16 */
    stack: "2rem",      /* 32 */
    section: "4rem",    /* 64 */
  },
  compact: {
    "control-xs": "1.25rem",
    "control-sm": "1.5rem",
    "control-md": "1.75rem",
    "control-lg": "2rem",
    gutter: "0.75rem",  /* 12 */
    stack: "1.5rem",    /* 24 */
    section: "3rem",    /* 48 */
  },
  comfortable: {
    "control-xs": "1.75rem",
    "control-sm": "2rem",
    "control-md": "2.25rem",
    "control-lg": "2.5rem",
    gutter: "1.25rem",  /* 20 */
    stack: "2.5rem",    /* 40 */
    section: "5rem",    /* 80 */
  },
}

/* ── @theme mappings ─────────────────────────────────────────────────────── */
/* Tailwind's own numeric palette for these hues, cleared so only Minima's
   1–12 vocabulary exists. Two scales for one hue name is how drift starts. */
const TW_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const TYPE = {
  "--text-2xs": "0.6875rem",
  "--text-2xs--line-height": "1rem",
  "--text-xs": "0.75rem",
  "--text-xs--line-height": "1.125rem",
  "--text-sm": "0.8125rem",
  "--text-sm--line-height": "1.25rem",
  "--text-base": "0.875rem",
  "--text-base--line-height": "1.5rem",
  "--text-lg": "1rem",
  "--text-lg--line-height": "1.75rem",
  "--text-xl": "1.25rem",
  "--text-xl--line-height": "1.75rem",
  "--text-2xl": "1.5rem",
  "--text-2xl--line-height": "2rem",
  "--text-3xl": "2rem",
  "--text-3xl--line-height": "2.375rem",
  "--text-4xl": "2.5rem",
  "--text-4xl--line-height": "2.875rem",
  /* Signal register — mono, uppercase, for scanning. Smaller sizes take more
     tracking, because uppercase letterforms crowd as they shrink. */
  "--text-label-xs": "0.625rem",
  "--text-label-xs--line-height": "0.875rem",
  "--text-label-sm": "0.6875rem",
  "--text-label-sm--line-height": "1rem",
  "--text-label-md": "0.75rem",
  "--text-label-md--line-height": "1.125rem",
  "--tracking-label-xs": "0.14em",
  "--tracking-label-sm": "0.10em",
  "--tracking-label-md": "0.07em",

  "--tracking-tighter": "-0.03em",
  "--tracking-tight": "-0.015em",
  "--tracking-normal": "0em",
  "--tracking-wide": "0.04em",
  "--tracking-widest": "0.08em",
  "--leading-tight": "1.2",
  "--leading-snug": "1.4",
  "--leading-normal": "1.6",
  "--leading-relaxed": "1.75",
  "--font-sans": "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  "--font-mono": "var(--font-geist-mono), ui-monospace, 'SF Mono', monospace",
  "--ease-out-quart": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--ease-in-out-quad": "cubic-bezier(0.45, 0, 0.55, 1)",
  "--radius-none": "0px",
  "--radius-xs": "2px",
  "--radius-sm": "4px",
  "--radius-md": "var(--radius)",
  "--radius-lg": "8px",
  "--radius-xl": "12px",
  "--radius-2xl": "16px",
  "--radius-full": "9999px",

  /* Radius by element size. Roundness is relative: a chip and a modal cannot
     share a radius and both look right. These are the four that exist. */
  "--radius-chip": "var(--radius-sm)",      /* tags, pills, inline marks   */
  "--radius-control": "var(--radius-md)",   /* buttons, inputs, selects    */
  "--radius-panel": "var(--radius-xl)",     /* cards, panels               */
  "--radius-surface": "var(--radius-2xl)",  /* modals, sheets, large slabs */
  "--shadow-xs": "var(--elevation-xs)",
  "--shadow-sm": "var(--elevation-sm)",
  "--shadow-md": "var(--elevation-md)",
  "--shadow-lg": "var(--elevation-lg)",
  "--spacing-control-xs": "var(--control-xs)",
  "--spacing-control-sm": "var(--control-sm)",
  "--spacing-control-md": "var(--control-md)",
  "--spacing-control-lg": "var(--control-lg)",
  "--spacing-gutter": "var(--gutter)",
  "--spacing-stack": "var(--stack)",
  "--spacing-section": "var(--section)",
}

function themeVars() {
  const t = {}
  for (const name of HUE_NAMES) {
    for (const s of TW_STEPS) t[`--color-${name}-${s}`] = "initial"
    for (const s of STEPS) t[`--color-${name}-${s}`] = `var(--${name}-${s})`
    if (name !== "gray") t[`--color-${name}-on-solid`] = `var(--${name}-on-solid)`
  }

  /* Semantics that are not colours, and so get no --color-* utility. */
  const NOT_COLOUR = new Set(["radius", "disabled-opacity"])

  const roles = [
    ...Object.keys(SEMANTIC).filter((k) => !NOT_COLOUR.has(k)),
    "canvas",
    "surface",
    "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6",
  ]
  for (const r of roles) t[`--color-${r}`] = `var(--${r})`

  return { ...t, ...TYPE }
}

/* ── CSS emitter ─────────────────────────────────────────────────────────── */
/* Keys starting with `--` are emitted verbatim; plain CSS properties are
   listed here so they are not mistaken for custom properties. */
const PLAIN_PROPS = new Set(["color-scheme"])

const rule = (selector, vars) =>
  `${selector} {\n` +
  Object.entries(vars)
    .map(([k, v]) => {
      const prop = k.startsWith("--") || PLAIN_PROPS.has(k) ? k : `--${k}`
      return `  ${prop}: ${v};`
    })
    .join("\n") +
  `\n}\n`

const HEADER = `/* ═══════════════════════════════════════════════════════════════════════════
   MINIMA — TOKEN LAYER
   GENERATED FILE — edit scripts/build-tokens.mjs and re-run:
       node scripts/build-tokens.mjs

   Three token layers, and the boundary between them is the whole discipline:
     PRIMITIVE  --{hue}-{1..12}   what a colour IS      (scales.css)
     SEMANTIC   --{role}          what a colour is FOR  (this file)
     COMPONENT  --{component}-*   only when semantic cannot express it

   Components read the semantic layer. Never the primitive one. See CHARTER.md.
   ═══════════════════════════════════════════════════════════════════════════ */
`

const SECTION = {
  semantic: `
/* ── Semantic layer ─────────────────────────────────────────────────────────
   Mode-independent by construction. Both themes read these exact lines; only
   the ramps beneath them change. A literal colour value here is a bug. */
`,
  data: `
/* ── Data ───────────────────────────────────────────────────────────────────
   The one job that is genuinely mode-dependent: a series mark needs >= 3:1
   against its surface, and step 9 is vivid on near-black but washes out on
   white — amber measures 2.56:1 there. Light uses step 11, whose contract is
   >= 4.5:1 against steps 1/2; dark stays at 9. */
`,
  canvas: `
/* ── Canvas & surface ───────────────────────────────────────────────────────
   One is the page backdrop, the other is what a component sits on. The
   "raised" look separates them; "flat" collapses them and lets hairlines
   carry the structure. In dark the pair swaps role, not meaning: raised
   still sits lighter than the canvas. */
`,
  density: `
/* ── Density ────────────────────────────────────────────────────────────────
   Spacing inherits Tailwind's 4px rhythm. Minima adds control geometry and
   three rhythm tokens, so density is one attribute rather than a thousand
   call-site decisions. Switch with [data-density] on <html>. */
`,
}

const tokensCss =
  HEADER +
  "\n" +
  rule("@theme inline", themeVars()) +
  SECTION.semantic +
  rule(":root,\n.dark", SEMANTIC) +
  SECTION.data +
  rule(":root", chartVars(11)) +
  rule(".dark", chartVars(9)) +
  SECTION.canvas +
  rule(":root", { "color-scheme": "light", ...CANVAS_LIGHT }) +
  rule(':root[data-surface="flat"]', { canvas: "var(--gray-1)", surface: "var(--gray-1)" }) +
  rule(".dark", { "color-scheme": "dark", ...CANVAS_DARK }) +
  rule('.dark[data-surface="flat"]', { canvas: "var(--gray-2)", surface: "var(--gray-2)" }) +
  SECTION.density +
  rule(":root", DENSITY.default) +
  rule(':root[data-density="compact"]', DENSITY.compact) +
  rule(':root[data-density="comfortable"]', DENSITY.comfortable)

writeFileSync(new URL("../src/app/tokens.css", import.meta.url), tokensCss)

/* ── Registry ────────────────────────────────────────────────────────────── */
const densityCss = Object.fromEntries(
  Object.entries(DENSITY)
    .filter(([k]) => k !== "default")
    .map(([k, v]) => [
      `:root[data-density="${k}"]`,
      Object.fromEntries(Object.entries(v).map(([kk, vv]) => [`--${kk}`, vv])),
    ])
)

const uiItem = (name, title, description, deps) => ({
  name,
  type: "registry:ui",
  title,
  description,
  ...(deps ? { dependencies: deps } : {}),
  files: [{ path: `src/components/minima/${name}.tsx`, type: "registry:ui" }],
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "minima",
  homepage: `https://github.com/${OWNER}/${REPO}`,
  items: [
    {
      name: "minima",
      type: "registry:base",
      title: "Minima",
      author: "Enric Trillo",
      description:
        "A neutral-dominant design system. Neutral carries structure; colour is spent only on state, identity and data.",
      config: {
        style: "base-nova",
        tailwind: { baseColor: "neutral", cssVariables: true },
        iconLibrary: "lucide",
      },
      registryDependencies: [
        "minima-theme",
        "status", "note", "kbd", "stat", "code",
        "button", "badge", "card", "input", "label", "select",
        "separator", "table", "tabs", "progress", "avatar",
      ],
    },
    {
      name: "minima-theme",
      type: "registry:theme",
      title: "Minima Theme",
      description:
        "Thirteen OKLCH ramps of twelve steps on Radix step semantics, a canvas/surface pair, three density modes, and a semantic layer where every token resolves to a ramp step.",
      cssVars: {
        theme: themeVars(),
        light: {
          ...rampVars("light"),
          ...CANVAS_LIGHT,
          ...chartVars(11),
          ...DENSITY.default,
          ...SEMANTIC,
        },
        dark: {
          ...rampVars("dark"),
          ...CANVAS_DARK,
          ...chartVars(9),
          ...SEMANTIC,
        },
      },
      css: {
        ':root[data-surface="flat"]': {
          "--canvas": "var(--gray-1)",
          "--surface": "var(--gray-1)",
        },
        '.dark[data-surface="flat"]': {
          "--canvas": "var(--gray-2)",
          "--surface": "var(--gray-2)",
        },
        ...densityCss,
        "@layer base": {
          "::selection": {
            background: "var(--accent-hue-subtle)",
            color: "var(--accent-hue-text)",
          },
          ":focus-visible": {
            outline: "2px solid var(--ring)",
            "outline-offset": "2px",
          },
          "[data-numeric]": {
            "font-family": "var(--font-mono)",
            "font-variant-numeric": "tabular-nums",
            "font-feature-settings": "'tnum', 'zero'",
          },
        },
        "@layer utilities": {
          ".hairline": { border: "1px solid var(--border)" },
          ".hairline-t": { "border-top": "1px solid var(--border)" },
          ".hairline-r": { "border-right": "1px solid var(--border)" },
          ".hairline-b": { "border-bottom": "1px solid var(--border)" },
          ".hairline-l": { "border-left": "1px solid var(--border)" },
          ".label-eyebrow": {
            "font-size": "var(--text-2xs)",
            "font-weight": "500",
            "text-transform": "uppercase",
            "letter-spacing": "var(--tracking-widest)",
            color: "var(--subtle-foreground)",
          },
          ".numeric": {
            "font-family": "var(--font-mono)",
            "font-variant-numeric": "tabular-nums",
          },
          ".delta-up": { color: "var(--success-text)" },
          ".delta-down": { color: "var(--danger-text)" },
          ".delta-flat": { color: "var(--subtle-foreground)" },
        },
      },
    },
    uiItem("status", "Status", "Status pill and dot. The canonical carrier of the state colour job.", ["class-variance-authority"]),
    uiItem("note", "Note", "A bordered callout that defaults to neutral and escalates to a state tone only when the message reports state.", ["class-variance-authority"]),
    uiItem("kbd", "Kbd", "A keyboard key. Always neutral — a shortcut is not a state."),
    uiItem("stat", "Stat", "A single metric. Mono tabular value, with the delta as the only coloured element."),
    uiItem("code", "Code", "Inline code and code blocks. Always mono, never coloured — syntax highlighting is a product concern."),
  ],
}

writeFileSync(
  new URL("../registry.json", import.meta.url),
  JSON.stringify(registry, null, 2) + "\n"
)

console.log(
  `wrote src/app/tokens.css and registry.json — ` +
    `${HUE_NAMES.length} ramps × ${STEPS.length} steps, ` +
    `${Object.keys(registry.items[1].cssVars.light).length} light vars`
)
