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

import { readFileSync, writeFileSync } from "node:fs"

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


/* ── Utilities ──────────────────────────────────────────────────────────────
   These are part of the system, not the showcase. The Charter mandates the
   signal register (7.6), concentric nesting (5.2), the code treatment (7.8)
   and prose (7.4) — so the registry has to ship them, or a consumer gets a
   set of tokens and none of the rules that use them.                        */
const UTILITIES = {
  /* The hairline. Minima's primary separation device — used far more often
     than shadow, and the only one the flat look has. */
  ".hairline": { border: "1px solid var(--border)" },
  ".hairline-t": { "border-top": "1px solid var(--border)" },
  ".hairline-r": { "border-right": "1px solid var(--border)" },
  ".hairline-b": { "border-bottom": "1px solid var(--border)" },
  ".hairline-l": { "border-left": "1px solid var(--border)" },

  /* Signal register — mono, uppercase, tracked. For text that is SCANNED,
     never text that is READ. Smaller sizes take more tracking, because
     uppercase letterforms crowd as they shrink. */
  ".label-xs, .label-sm, .label-md, .label-eyebrow": {
    "font-family": "var(--font-mono)",
    "font-weight": "500",
    "text-transform": "uppercase",
    color: "var(--subtle-foreground)",
  },
  ".label-xs": {
    "font-size": "var(--text-label-xs)",
    "line-height": "var(--text-label-xs--line-height)",
    "letter-spacing": "var(--tracking-label-xs)",
  },
  ".label-sm, .label-eyebrow": {
    "font-size": "var(--text-label-sm)",
    "line-height": "var(--text-label-sm--line-height)",
    "letter-spacing": "var(--tracking-label-sm)",
  },
  ".label-md": {
    "font-size": "var(--text-label-md)",
    "line-height": "var(--text-label-md--line-height)",
    "letter-spacing": "var(--tracking-label-md)",
  },

  ".numeric": {
    "font-family": "var(--font-mono)",
    "font-variant-numeric": "tabular-nums",
  },

  /* Deltas — colour here is doing the DATA job, so it is allowed. */
  ".delta-up": { color: "var(--success-text)" },
  ".delta-down": { color: "var(--danger-text)" },
  ".delta-flat": { color: "var(--subtle-foreground)" },

  /* Code — one treatment, both registers, never coloured. */
  ".code": {
    "font-family": "var(--font-mono)",
    "font-size": "0.875em",
    color: "var(--code-foreground)",
    background: "var(--code-bg)",
    border: "1px solid var(--code-border)",
    "border-radius": "var(--radius-chip)",
    padding: "0.1em 0.35em",
    "white-space": "nowrap",
  },
  ".code-block": {
    "font-family": "var(--font-mono)",
    "font-size": "var(--text-sm)",
    "line-height": "var(--leading-normal)",
    color: "var(--code-foreground)",
    background: "var(--code-bg)",
    border: "1px solid var(--code-border)",
    "border-radius": "var(--radius-panel)",
    padding: "var(--gutter)",
    "overflow-x": "auto",
    "tab-size": "2",
  },

  /* Links. `.link` is the identity hue in UI context. `.link-quiet` is for
     links inside a container that already signals interactivity — a nav, a
     table row, a card. Charter 7.9 forbids it in running text, where an
     undecorated link is indistinguishable from prose. */
  ".link": {
    color: "var(--accent-hue-text)",
    "text-decoration": "underline",
    "text-decoration-color": "var(--accent-hue-border)",
    "text-underline-offset": "0.2em",
  },
  ".link:hover": { "text-decoration-color": "currentColor" },
  ".link-quiet": {
    color: "inherit",
    "text-decoration": "none",
    cursor: "pointer",
  },
  ".link-quiet:hover": { color: "var(--foreground)" },
  ".link-quiet:focus-visible": {
    "text-decoration": "underline",
    "text-decoration-color": "currentColor",
    "text-underline-offset": "0.2em",
  },

  /* Concentric nesting — inner = outer - (padding + border), one level deep.
     `--nest-optical` adds back the pixel the eye wants at small radii. */
  ".nest": {
    "--nest-border": "1px",
    "--nest-optical": "1px",
    "border-radius": "var(--nest-r)",
    padding: "var(--nest-p)",
  },
  ".nest-surface": { "--nest-r": "var(--radius-surface)", "--nest-p": "var(--gutter)" },
  ".nest-panel": { "--nest-r": "var(--radius-panel)", "--nest-p": "var(--gutter)" },
  ".nest-control": { "--nest-r": "var(--radius-control)", "--nest-p": "0.5rem" },
  ".nest-inset": { "--nest-r": "var(--radius-surface)", "--nest-p": "0.25rem" },
  ".nested": {
    "border-radius":
      "max(2px, calc(var(--nest-r) - var(--nest-p) - var(--nest-border) + var(--nest-optical)))",
  },
}

/* ── Prose ──────────────────────────────────────────────────────────────────
   Long-form reading. Body sits at the muted level so a page of text never
   shouts; bold jumps to maximum contrast, so emphasis is the thing that does.
   Measure is capped in ch, so it tracks the font rather than the viewport. */
const PROSE = {
  ".prose": {
    color: "var(--prose-body)",
    "font-size": "var(--text-lg)",
    "line-height": "var(--leading-relaxed)",
    "max-width": "68ch",
  },
  ".prose > * + *": { "margin-top": "1.25em" },
  ".prose strong, .prose b": { color: "var(--prose-strong)", "font-weight": "600" },
  ".prose h2, .prose h3, .prose h4": {
    color: "var(--prose-heading)",
    "font-weight": "600",
    "letter-spacing": "var(--tracking-tight)",
    "line-height": "var(--leading-tight)",
    "text-wrap": "balance",
  },
  ".prose h2": { "font-size": "var(--text-2xl)", "margin-top": "2.5em" },
  ".prose h3": { "font-size": "var(--text-xl)", "margin-top": "2em" },
  ".prose h4": { "font-size": "var(--text-lg)", "margin-top": "1.75em" },
  ".prose a": {
    color: "var(--prose-link)",
    "text-decoration": "underline",
    "text-decoration-color": "var(--accent-hue-border)",
    "text-underline-offset": "0.2em",
  },
  ".prose a:hover": { "text-decoration-color": "currentColor" },
  ".prose code": {
    color: "var(--code-foreground)",
    background: "var(--code-bg)",
    border: "1px solid var(--code-border)",
    "border-radius": "var(--radius-chip)",
    padding: "0.1em 0.35em",
    "font-size": "0.875em",
  },
  ".prose pre": {
    background: "var(--code-bg)",
    border: "1px solid var(--code-border)",
    "border-radius": "var(--radius-panel)",
    padding: "var(--gutter)",
    "overflow-x": "auto",
    "font-size": "var(--text-sm)",
    "line-height": "var(--leading-normal)",
    "tab-size": "2",
  },
  ".prose pre code": { background: "none", border: "0", padding: "0", "font-size": "inherit" },
  ".prose blockquote": {
    "border-left": "2px solid var(--border-active)",
    "padding-left": "var(--gutter)",
    color: "var(--prose-body)",
  },
  ".prose ul, .prose ol": { "padding-left": "1.25em" },
  ".prose li": { "margin-top": "0.5em" },
  ".prose li::marker": { color: "var(--prose-marker)" },
  ".prose hr": { border: "0", "border-top": "1px solid var(--border)", "margin-block": "2.5em" },
  ".prose figcaption, .prose small": {
    color: "var(--subtle-foreground)",
    "font-size": "var(--text-sm)",
  },
}

/* ── Base ───────────────────────────────────────────────────────────────────
   Rules the system owns so no component reinvents them (Charter 4.5). */
const BASE = {
  "code, kbd, samp, pre": {
    "font-family": "var(--font-mono)",
    "font-feature-settings": "'tnum', 'zero'",
  },
  '[disabled], [aria-disabled="true"], [data-disabled]': {
    opacity: "var(--disabled-opacity)",
    cursor: "not-allowed",
  },
  "::selection": {
    background: "var(--accent-hue-subtle)",
    color: "var(--accent-hue-text)",
  },
  ":focus-visible": { outline: "2px solid var(--ring)", "outline-offset": "2px" },
  "[data-numeric]": {
    "font-family": "var(--font-mono)",
    "font-variant-numeric": "tabular-nums",
    "font-feature-settings": "'tnum', 'zero'",
  },
  /* The browser paints autofilled inputs a fixed yellow that ignores every
     token and survives both themes. An inset shadow is the only way back. */
  "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill, select:-webkit-autofill":
    {
      "-webkit-text-fill-color": "var(--foreground)",
      "-webkit-box-shadow": "0 0 0 1000px var(--surface) inset",
      "caret-color": "var(--foreground)",
      transition: "background-color 10000s ease-in-out 0s",
    },
  /* Scrollbars are chrome: thin and neutral, never the accent. */
  html: {
    "scrollbar-width": "thin",
    "scrollbar-color": "var(--scrollbar-thumb) transparent",
  },
  "::-webkit-scrollbar": { width: "10px", height: "10px" },
  "::-webkit-scrollbar-track": { background: "transparent" },
  "::-webkit-scrollbar-thumb": {
    background: "var(--scrollbar-thumb)",
    border: "3px solid transparent",
    "border-radius": "var(--radius-full)",
    "background-clip": "content-box",
  },
  "::-webkit-scrollbar-thumb:hover": {
    background: "var(--scrollbar-thumb-hover)",
    "background-clip": "content-box",
  },
  "::-webkit-scrollbar-corner": { background: "transparent" },
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

/** Emit a nested block: `@layer utilities { .a { … } .b { … } }` */
const layer = (name, groups) =>
  `@layer ${name} {\n` +
  Object.entries(groups)
    .map(
      ([sel, decls]) =>
        `  ${sel} {\n` +
        Object.entries(decls)
          .map(([k, v]) => `    ${k}: ${v};`)
          .join("\n") +
        `\n  }`
    )
    .join("\n") +
  `\n}\n`

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
  rule(':root[data-density="comfortable"]', DENSITY.comfortable) +
  "\n" +
  layer("base", BASE) +
  "\n" +
  layer("utilities", UTILITIES) +
  "\n" +
  layer("components", PROSE)

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


/* ── Fonts ──────────────────────────────────────────────────────────────────
   Minima ships a default pair rather than leaving consumers on the system
   stack, because the signal register (7.6) and every numeral depend on a mono
   face actually being present.

   Shipping a default is a convenience, not an identity claim. `--font-sans`
   and `--font-mono` are the only tokens that name a family, so replacing the
   pair is a two-line change and every typographic rule in Article 7 holds for
   any pair that includes a mono.                                            */
const fontItem = (name, title, family, imported, variable, dependency) => ({
  name,
  type: "registry:font",
  title,
  description: `${family} — wired to \`${variable}\`, which \`--font-${
    variable.includes("mono") ? "mono" : "sans"
  }\` resolves to.`,
  font: {
    family,
    provider: "google",
    import: imported,
    variable,
    subsets: ["latin"],
    /* Required, not optional in practice. On Next the CLI rewrites the layout
       to import from next/font/google; everywhere else it falls back to an npm
       package whose name it derives from the ITEM name. That derivation gives
       `@fontsource-variable/geist-sans`, which does not exist — the package is
       `@fontsource-variable/geist`. Naming it explicitly is the difference
       between a working install and a 404 on every non-Next consumer. */
    dependency,
  },
})

const uiItem = (name, title, description) => {
  const path = `src/components/minima/${name}.tsx`
  const dependencies = npmDeps(path)
  return {
    name,
    type: "registry:ui",
    title,
    description,
    ...(dependencies.length ? { dependencies } : {}),
    files: [{ path, type: "registry:ui" }],
  }
}

/* ── Addressing ─────────────────────────────────────────────────────────────
   A registryDependency is an ADDRESS, not a name, and the CLI decides which
   registry to ask from the shape of the string. Fewer than three slash-
   separated segments is the `shadcn` scheme: the item is fetched from
   `ui.shadcn.com/r/styles/<style>/<name>.json`. Only `<owner>/<repo>/<item>`
   reaches this registry.

   Every dependency of the base item was written bare, so `minima-theme`,
   `status`, `note`, `kbd`, `stat` and `code` were all being requested from
   upstream, where they do not exist — `npx shadcn add phugadev/minima/minima`
   failed on the first one and installed nothing. Qualifying is not a
   refinement; it is the difference between the headline install working and
   erroring out.                                                             */
const local = (name) => `${OWNER}/${REPO}/${name}`

/* ── The component layer ────────────────────────────────────────────────────
   Article 12 is a claim about components, so the registry has to ship the
   components. These are shadcn/ui's base-nova components re-tuned to obey it:
   radius keyed to element size (12.1), height from the density tokens (12.2),
   one interaction ladder (12.3), one focus ring (12.4), the signal register on
   chrome (12.5) and no `transition: all` (12.6). Every one of them differs
   from its upstream original.

   Depending on the upstream names instead — which is what this item did —
   ships the tokens and then a set of components that ignore them: controls
   fixed at one height whatever `data-density` says, radii off the four the
   system defines, and the seven focus rings 12.4 exists to have removed. The
   Charter would be enforced in the showcase and nowhere a consumer can see.  */
const SIGNATURE = [
  ["button", "Button"],
  ["badge", "Badge"],
  ["card", "Card"],
  ["input", "Input"],
  ["label", "Label"],
  ["select", "Select"],
  ["separator", "Separator"],
  ["table", "Table"],
  ["tabs", "Tabs"],
  ["progress", "Progress"],
]

/* npm dependencies are read out of the source rather than listed here, because
   a hand-kept list is a second source of truth for something the import
   statements already state. `@/...` is the consumer's own alias, not a
   package; everything else bare is one, scoped names keeping two segments.  */
const PEERS = new Set(["react", "react-dom"])

const npmDeps = (path) => {
  const src = readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
  const specifiers = [...src.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1])
  const packages = specifiers
    .filter((spec) => !spec.startsWith("@/") && !spec.startsWith("."))
    .map((spec) => spec.split("/").slice(0, spec.startsWith("@") ? 2 : 1).join("/"))
    .filter((pkg) => !PEERS.has(pkg))
  return [...new Set(packages)].sort()
}

const signatureItem = (name, title) => {
  const path = `src/components/ui/${name}.tsx`
  const dependencies = npmDeps(path)
  return {
    name,
    type: "registry:ui",
    title,
    description: `${title}, carrying the Article 12 component signature.`,
    ...(dependencies.length ? { dependencies } : {}),
    files: [{ path, type: "registry:ui" }],
  }
}

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
        "font-geist-sans",
        "font-geist-mono",
        "status", "note", "kbd", "stat", "code",
        "container", "section",
        ...SIGNATURE.map(([name]) => name),
      ].map(local),
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
        "@layer base": BASE,
        "@layer utilities": UTILITIES,
        "@layer components": PROSE,
      },
    },
    uiItem("status", "Status", "Status pill and dot. The canonical carrier of the state colour job."),
    uiItem("note", "Note", "A bordered callout that defaults to neutral and escalates to a state tone only when the message reports state."),
    uiItem("kbd", "Kbd", "A keyboard key. Always neutral — a shortcut is not a state."),
    uiItem("stat", "Stat", "A single metric. Mono tabular value, with the delta as the only coloured element."),
    uiItem("code", "Code", "Inline code and code blocks. Always mono, never coloured — syntax highlighting is a product concern."),
    uiItem("container", "Container", "The horizontal frame — a measure, centred, with the gutter. Widths are typographic; the gutter moves with density."),
    uiItem("section", "Section", "A region of the page, carrying the top rung of the rhythm ladder, plus an optional header on the reading measure."),
    fontItem("font-geist-sans", "Geist Sans", "Geist", "Geist", "--font-geist-sans", "@fontsource-variable/geist"),
    fontItem("font-geist-mono", "Geist Mono", "Geist Mono", "Geist_Mono", "--font-geist-mono", "@fontsource-variable/geist-mono"),
    ...SIGNATURE.map(([name, title]) => signatureItem(name, title)),
  ],
}

writeFileSync(
  new URL("../registry.json", import.meta.url),
  JSON.stringify(registry, null, 2) + "\n"
)

/* ── The version, as source ─────────────────────────────────────────────────
   The showcase needs the package version at runtime. Reading it from
   package.json directly does not survive the production client bundle — a
   named JSON import resolves in dev and comes back undefined in `next build`,
   which shipped a header reading "v" with nothing after it. Emitting it as a
   module makes it an ordinary string with no bundler-dependent behaviour, and
   puts it under the same in-sync check as every other generated file (9.1).  */
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)
writeFileSync(
  new URL("../src/lib/version.ts", import.meta.url),
  `/* Generated by scripts/build-tokens.mjs — do not edit. */\n` +
    `export const VERSION = "${pkg.version}"\n`
)

console.log(
  `wrote src/app/tokens.css and registry.json — ` +
    `${HUE_NAMES.length} ramps × ${STEPS.length} steps, ` +
    `${Object.keys(registry.items[1].cssVars.light).length} light vars`
)
