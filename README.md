# Minima

A neutral-dominant design system. Neutral carries structure, hierarchy and
weight. Colour is spent on exactly three jobs, and never on decoration:

| Job | What gets colour |
| --- | --- |
| **State** | success · warning · danger · info |
| **Identity** | one hue — links, focus, selection, active |
| **Data** | a six-step categorical chart ramp |

Everything else — primary buttons included — is neutral.

## Install

The repository *is* the registry. There is no server and no JSON to deploy.

```bash
npx shadcn@latest add phugadev/minima/minima
```

That installs the token layer, the config and every component. Pin a version
with `#ref` — a branch, tag or commit SHA. Private access uses `GH_TOKEN` with
Contents: Read-only.

Individual items:

```bash
npx shadcn@latest add phugadev/minima/minima-theme   # tokens only
npx shadcn@latest add phugadev/minima/status
npx shadcn@latest add phugadev/minima/note
npx shadcn@latest add phugadev/minima/kbd
npx shadcn@latest add phugadev/minima/stat
npx shadcn@latest add phugadev/minima/code
npx shadcn@latest add phugadev/minima/button        # and badge, card, input,
                                                    # label, select, separator,
                                                    # table, tabs, progress
```

The last group is shadcn/ui's components re-tuned to the Article 12 signature —
radius keyed to element size, height from the density tokens, one interaction
ladder, one focus ring. Minima ships its own rather than depending on the
upstream names, because the upstream ones do not read the tokens.

## Type

Minima ships **Geist Sans** and **Geist Mono** as registry font items, because
the signal register and every numeral depend on a mono face being present.

It is a default, not an identity claim. `--font-sans` and `--font-mono` are the
only tokens that name a family, so swapping the pair is two lines:

```css
:root {
  --font-sans: "Your Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Your Mono", ui-monospace, monospace;
}
```

Every typographic rule in the system holds for any pair that includes a mono.

## How it is built

Three token layers, and the boundary between them is the whole discipline:

| Layer | Shape | Answers |
| --- | --- | --- |
| **Primitive** | `--{hue}-{1..12}` | what a colour **is** |
| **Semantic** | `--{role}` | what a colour is **for** |
| **Component** | `--{component}-*` | only what semantic cannot express |

Components read the semantic layer. Never the primitive one.

The palette is thirteen ramps of twelve steps, generated in OKLCH on
[Radix step semantics](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
adopted verbatim. Chroma is deliberately pushed past the sRGB boundary, so
saturated steps render wide on a P3 display and are gamut-mapped down
elsewhere — one palette, two gamuts.

Dark mode is not an inversion. The semantic layer is written once and read by
both themes; only the ramps beneath it change.

## The Charter

[`CHARTER.md`](CHARTER.md) is the constitution — eleven articles of numbered,
citable clauses, plus the documented deviations and the process for amending
any of it. A rendered version lives at [`public/charter.html`](public/charter.html).

It exists because a design system's cost is not building it, it is
re-litigating it.

## Working on it

```bash
npm install
npm run dev        # the system, documented by demonstrating itself
npm run registry   # regenerate tokens, docs and the registry
npm run audit      # Charter Article 8 — contrast floors
npm run audit:registry  # Charter 9.6 — the registry ships what the system defines
```

Changes arrive through pull requests; `main` is protected and CI has to be
green. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the change flow and what
each version bump means.

Generated files are never hand-edited:

| File | Owner |
| --- | --- |
| `src/app/scales.css` | `scripts/generate-scales.mjs` |
| `src/app/tokens.css` | `scripts/build-tokens.mjs` |
| `src/lib/version.ts` | `scripts/build-tokens.mjs` |
| `registry.json`, `public/r/*` | `scripts/build-tokens.mjs`, `shadcn build` |
| `public/charter.html` | `scripts/build-charter.mjs` |

## Licence

MIT — see [`LICENSE`](LICENSE).
