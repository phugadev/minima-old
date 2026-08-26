# The Minima Charter

Minima is a neutral-dominant design system. This document is its constitution:
the decisions that are settled, the reasoning behind each one, and the process
for changing them.

It exists for one reason. A design system's cost is not building it — it is
re-litigating it. Every time a token's meaning is inferred rather than looked
up, the vocabulary drifts a little, and drift is paid for in sessions that
rediscover decisions already made. What follows is written to be *cited*, not
merely read.

**Status of this document.** Anything marked NORMATIVE is binding on Minima and
on anything built with it. Anything marked RATIONALE explains a decision and may
be argued with. Anything in *Documented deviations* is a place Minima knowingly
departs from its own rule — those are settled, and re-opening one requires the
amendment process in Article 9.

---

## Article 1 — The colour thesis

**1.1 NORMATIVE.** Neutral carries structure, hierarchy and weight. Colour is
spent on exactly three jobs:

| Job | What it covers |
| --- | --- |
| **State** | success · warning · danger · info |
| **Identity** | one hue — links, focus rings, selection, active item |
| **Data** | the categorical chart ramp |

**1.2 NORMATIVE.** If a colour is not doing one of those three jobs, it is
neutral. There is no fourth job, and "brand expression" is not one.

**1.3 NORMATIVE.** The primary action is neutral — `--primary` resolves to
`gray-12`. A coloured primary button is a violation.

**1.4 RATIONALE.** Restraint is what makes the accent legible. A system where
five things are coloured has no accent; it has decoration. The discipline is
not aesthetic preference — it is that colour retains meaning only if it is
scarce.

---

## Article 2 — Token layers

**2.1 NORMATIVE.** There are exactly three layers, and the boundary between them
is the whole discipline:

| Layer | Shape | Answers | Lives in |
| --- | --- | --- | --- |
| **Primitive** | `--{hue}-{1..12}` | what a colour **is** | `src/app/scales.css` |
| **Semantic** | `--{role}` | what a colour is **for** | `src/app/tokens.css` |
| **Component** | `--{component}-{property}` | only what semantic cannot express | the component |

**2.2 NORMATIVE.** Components read the semantic layer. A component that
references a primitive token is a bug, without exception. The same applies to
hand-written CSS in `globals.css`.

**2.3 NORMATIVE.** A semantic token is named for its **role**, never its
appearance. `--border-strong` is legal; `--border-gray-7` is not, and neither
is `--border-dark` — the second breaks the moment the theme flips.

**2.4 NORMATIVE.** The semantic layer is mode-independent. Both themes read the
same declarations; only the ramps beneath them change. A literal colour value in
the semantic layer is a bug. The single exception is Article 6.4.

**2.5 RATIONALE.** This is the property that makes dark mode structural rather
than a second design. Nothing is "re-derived by hand for dark" because nothing
in the semantic layer knows which theme it is in.

---

## Article 3 — The scale

**3.1 NORMATIVE.** Thirteen ramps — `gray` plus twelve hues: red, orange, amber,
yellow, lime, green, teal, cyan, blue, indigo, purple, pink. Twelve steps each,
numbered `1`–`12`.

**3.2 NORMATIVE.** Step semantics are Radix's, adopted verbatim:

| Step | Meaning | Step | Meaning |
| --- | --- | --- | --- |
| 1 | App background | 7 | Element border / focus ring |
| 2 | Subtle background | 8 | Hovered element border |
| 3 | Element background | 9 | **Solid** |
| 4 | Hovered element background | 10 | Hovered solid |
| 5 | Active / selected background | 11 | Low-contrast text |
| 6 | Subtle border | 12 | High-contrast text |

**3.3 RATIONALE.** Adopted, not invented. A shared vocabulary is only worth
having if it is the one everyone else already speaks, and the alternatives fail
that test: Tailwind's 50–950 is a *utility* palette where no step means
"border", and Base UI is headless and ships no palette at all. The twelve-step
model also carries published per-step contrast contracts, which turns
accessibility into a property of the scale rather than something re-measured by
hand each time. Minima's own earlier ten-step attempt had to bolt three border
tokens on top of the scale; here they are steps 6, 7 and 8.

**3.4 NORMATIVE.** Every semantic token resolves to a step. The map:

| Step | Roles |
| --- | --- |
| 1 | `--surface` (flat), `--canvas` (dark raised), `--primary-foreground` |
| 2 | `--canvas` (light raised), `--surface` (dark raised) |
| 3 | `--fill`, `--muted`, `--secondary`, `{tone}-subtle`, `--accent-hue-subtle` |
| 4 | `--fill-hover`, `--accent` |
| 5 | `--fill-active` |
| 6 | `--border`, `{tone}-border`, `--accent-hue-border` |
| 7 | `--border-strong`, `--input` |
| 8 | `--border-active` |
| 9 | `{tone}`, `--accent-hue`, `--ring`, dark `--chart-*` |
| 10 | `{tone}-hover`, `--subtle-foreground` |
| 11 | `--muted-foreground`, `{tone}-text`, `--accent-hue-text`, `--prose-body`, light `--chart-*` |
| 12 | `--foreground`, `--primary`, `--prose-strong` |

**3.5 NORMATIVE.** The scale is generated, in OKLCH, by
`scripts/generate-scales.mjs`. Chroma is deliberately pushed past the sRGB
boundary: saturated steps render wide on a P3 display and are gamut-mapped down
elsewhere. One palette, two gamuts — there is no separate P3 palette.

**3.6 NORMATIVE.** State tones map to hues as: success → green, warning → amber,
danger → red, info → cyan. Identity is blue. These are fixed; a product that
wants a different identity hue changes `--accent-hue` in the semantic layer, not
the scale.

---

## Article 4 — Canvas and surface

**4.1 NORMATIVE.** Two background tokens. `--canvas` is the page backdrop.
`--surface` is what a component sits on. Components reference only these two;
no component knows which look is active.

**4.2 NORMATIVE.** Two looks, switched by `data-surface` on `<html>`:

- `raised` (default) — canvas and surface differ by one step
- `flat` — canvas and surface are identical, and hairlines carry all structure

**4.3 NORMATIVE.** In dark, the pair swaps role, not meaning: a raised surface
sits *lighter* than its canvas. `--surface` always means "the thing a component
sits on", in both themes.

**4.4 NORMATIVE.** Hairline before shadow. Separation is a 1px border at
`--border`. Shadow is reserved for things that genuinely float — popovers,
dialogs, menus, dropdowns. The `flat` look has no shadow available to it at all,
which is the test: if a layout only reads in `raised`, the layout is leaning on
elevation it has not earned.

---

## Article 5 — Density

**5.1 NORMATIVE.** Spacing inherits Tailwind's 4px rhythm. Minima does not
define a spacing scale, because there is no reason to have two.

**5.2 NORMATIVE.** Minima defines control geometry — `--control-xs|sm|md|lg` —
and three rhythm tokens:

| Token | Means |
| --- | --- |
| `--gutter` | space inside a container |
| `--stack` | space between sibling blocks |
| `--section` | space between page sections |

**5.3 NORMATIVE.** Three rhythm tokens, not a dozen. If a gap is none of these,
the question to ask is whether the block belongs where it is.

**5.4 NORMATIVE.** Density is one attribute — `data-density` on `<html>`, one of
`compact` · `default` · `comfortable`. Density is never a per-component prop.

---

## Article 6 — Typography and prose

**6.1 NORMATIVE.** Two registers. **UI** text is small, tight and dense — 11px
to 14px, `--tracking-tight` on headings. **Prose** is larger and looser — 16px
body at `--leading-relaxed`.

**6.2 NORMATIVE.** Three text levels, no more:

| Token | Level | Use |
| --- | --- | --- |
| `--foreground` | primary | headings, emphasis, values |
| `--muted-foreground` | secondary | body copy, descriptions |
| `--subtle-foreground` | tertiary | meta, eyebrows, captions |

A fourth level is a sign the layout is doing too much; reach for spacing or a
hairline instead.

**6.3 NORMATIVE.** Numbers are always mono and tabular, at every size, via the
`data-numeric` attribute. Columns must align and changing digits must not
reflow. This is not negotiable per-context.

**6.4 NORMATIVE.** Prose body sits at `--muted-foreground` in both themes, and
`<strong>` jumps to `--foreground` — black on a light ground, white on a dark
one. A page of long-form text reads calm; emphasis is then the strongest signal
on the page rather than one of several.

**6.5 NORMATIVE.** Prose measure is capped at `68ch`, not a pixel width, so it
tracks the font rather than the viewport.

---

## Article 7 — Contrast floors

**7.1 NORMATIVE.** These are floors, not targets, and they are verified by an
automated audit rather than by eye:

| Pairing | Floor |
| --- | --- |
| `--foreground` on canvas or surface | 7:1 |
| `--muted-foreground`, `{tone}-text` on its own subtle fill | 4.5:1 |
| `--subtle-foreground` on canvas or surface | 3:1 |
| A data mark on the surface behind it | 3:1 |
| `--border` against its background | 1.15:1 |
| `--fill` against both canvas and surface | 1.06:1 |

**7.2 NORMATIVE.** A change that drops any pairing below its floor is not
shipped, regardless of how it looks.

**7.3 RATIONALE.** 7.1's last two rows exist because of a real regression: an
early version had `--muted` at 1.03:1 against the light canvas, which made every
tab list and secondary button vanish in light mode while looking correct in
dark. Structural contrast needs a floor exactly as much as text does.

---

## Article 8 — Generation

**8.1 NORMATIVE.** Generated files are never hand-edited:

| File | Owner |
| --- | --- |
| `src/app/scales.css` | `scripts/generate-scales.mjs` |
| `src/app/tokens.css` | `scripts/build-tokens.mjs` |
| `registry.json` | `scripts/build-tokens.mjs` |

**8.2 NORMATIVE.** The app's token layer and the registry's token layer are two
renderings of one object graph in `scripts/build-tokens.mjs`. They cannot drift,
because there is nothing to keep in sync.

**8.3 NORMATIVE.** `npm run tokens` regenerates. `npm run registry` regenerates
and rebuilds the registry.

**8.4 NORMATIVE.** Minima is distributed as a GitHub-hosted shadcn registry. The
repository *is* the registry:

```
npx shadcn@latest add phugadev/minima/minima
```

Pin with `#ref` (branch, tag or SHA). Private access uses `GH_TOKEN` with
Contents: Read-only.

**8.5 NORMATIVE.** Minima builds on shadcn/ui, whose current default style
(`base-nova`) is itself built on Base UI. These are one choice, not two: taking
shadcn/ui takes Base UI underneath it.

---

## Article 9 — Amendment

**9.1** A change to anything marked NORMATIVE is an amendment. It requires:

1. The rule being changed, cited by article number.
2. What breaks if it stays — a concrete failure, not a preference.
3. The contrast audit, re-run, with no pairing below its Article 7 floor.
4. This document, updated in the same change.

**9.2** A change that does not meet 9.1 is a preference, and preferences do not
move the charter. Build the thing you want at the component layer instead.

**9.3** Adding a *documented deviation* is an amendment. Removing one is also an
amendment — they are settled, and their settledness is the point.

---

## Documented deviations

Places Minima knowingly departs from its own rule. Each is settled. Each is here
so that nobody has to rediscover why.

**D1 — A third text level, sourced from step 10.**
Article 6.2 requires three text levels; the scale defines only two text steps
(11 and 12). `--subtle-foreground` is therefore drawn from step 10, which the
scale calls "hovered solid". It clears the 3:1 floor in both themes and is never
used for body copy. *Alternative rejected:* dropping to two text levels, which
loses the distinction between body copy and meta.

**D2 — Steps 9 and 10 carry a per-hue lightness bias.**
Steps 1–8 and 11–12 sit on one shared lightness track, so a border or a text
colour weighs the same in every hue. Steps 9 and 10 do not: warm hues are
lightened, because a hue cannot stay itself at an arbitrary lightness — amber at
blue's lightness is brown. Radix's own step 9 varies in lightness by hue for the
same reason. The bias is zero at steps 11 and 12, so accessible amber text is —
correctly — brown.

**D3 — Data is the one mode-dependent semantic.**
Article 2.4 requires the semantic layer to be mode-independent. `--chart-*` is
the exception: light uses step 11, dark uses step 9. No single step clears the
3:1 floor in both themes — amber measures 2.56:1 at step 10 on a light surface.
Step 11's published contract is ≥4.5:1, so the light ramp inherits a guarantee
rather than a measurement. *Alternative rejected:* a per-hue step choice, which
would make the chart ramp un-reasonable-about.

**D4 — Tailwind's numeric palette is cleared for Minima's hue names.**
`--color-{hue}-{50..950}` is set to `initial` in `@theme`, so only Minima's 1–12
vocabulary exists for those hues. Two scales sharing one hue name is precisely
how vocabulary drift starts.

---

## Not yet in scope

Named here so their absence reads as a decision rather than an oversight.

- **Motion** — duration and easing tokens exist; named transitions do not.
- **Components beyond the four originals** — `Status`, `Note`, `Kbd`, `Stat`.
  Everything else is stock shadcn/ui, re-tuned entirely through tokens.
- **A `registry:font` item** — fonts are wired in `layout.tsx` only, so registry
  consumers currently fall back to the system stack.
