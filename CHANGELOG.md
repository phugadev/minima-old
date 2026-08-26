# Changelog

All notable changes to Minima are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Minima follows
[semantic versioning](https://semver.org/) — see [CONTRIBUTING.md](CONTRIBUTING.md)
for what each bump means for a design system.

## [0.5.0] — 2026-08-26

### Added
- `scripts/build-charter.mjs` — `docs/charter.html` is now generated from
  `CHARTER.md`. It had been a hand-maintained duplicate with no source, which
  is precisely the drift Charter 9.1 forbids, sitting inside the document that
  forbids it. The renderer refuses to write a Charter that dropped a clause.
- Charter 7.9 — an undecorated link is permitted only where its container
  already signals interactivity, never in running text.
- CI checks that a version bump comes with a matching `CHANGELOG.md` entry.
- A real `README.md`.

### Changed
- **The registry now ships the utilities the Charter mandates.** `.code`,
  `.code-block`, `.label-xs/sm/md`, `.link`, `.link-quiet`, `.nest*`,
  `.nested` and `.prose` existed in the app but not in the registry, so a
  consumer installing `minima-theme` received the tokens and none of the rules
  that use them — no signal register (7.6), no nesting (5.2), no code
  treatment (7.8), no prose (7.4). `scripts/build-tokens.mjs` now owns them and
  emits the same CSS to both `src/app/tokens.css` and `registry.json`.
- `src/app/globals.css` is down to document-level setup and one showcase
  decoration; everything the system defines is generated.
- `.link-quiet` gains `cursor` and a `focus-visible` treatment. Without them it
  was a link identifiable only by hovering it.
- Article 10's clauses are tagged `NORMATIVE` like every other clause. They
  were untagged, which made the renderer drop them silently.

### Removed
- Default `create-next-app` assets: `file.svg`, `globe.svg`, `next.svg`,
  `vercel.svg`, `window.svg` — none referenced.
- `src/components/ui/avatar.tsx` — no importers.
- `.claude/settings.local.json` from version control, and `*.tsbuildinfo`
  added to `.gitignore`.

## [0.4.0] — 2026-08-26

### Added
- `.github/workflows/verify.yml` — CI runs types, lint, a generated-files-in-sync
  check, the build, and the contrast audit on every push and pull request.
  Charter 8.2 and 9.1 are now enforced rather than remembered.
- `CONTRIBUTING.md` and a pull request template encoding the Article 10.1
  amendment checklist.
- This changelog.
- Charter Article 11 — change flow and versioning.

### Changed
- Changes now arrive through pull requests rather than direct commits to `main`.
- `CHARTER.md` version tracks the package version. It previously had its own
  numbering, which had already drifted to v0.5 against a package at 0.1.0.

### Fixed
- Commit authorship. Commits before this release were authored with an address
  not associated with the GitHub account, so they never linked and did not count
  toward contributions. Repo-local git config now uses the account's noreply
  address. Existing commits were deliberately left unrewritten.

## [0.3.1] — 2026-08-26

### Added
- `scripts/audit-contrast.mjs` and `npm run audit` — the runner for Charter
  Article 8. Floors encoded as data with clause numbers, checked across both
  themes and both surface looks. Exits non-zero on breach, and treats an
  undefined token as a failure rather than a pass.
- Charter 8.4, 9.5 and D6.

### Fixed
- Text on solid state fills fell below the 4.5:1 floor: `danger-foreground` on
  `--danger` measured 4.42:1 and `info-foreground` on `--info` measured 3.15:1,
  in every mode. `on-solid` was a hand-set flag per hue that silently stopped
  being true when the ramps moved from 10 steps to 12. It is now computed from
  luminance, and the generator throws rather than emit a palette where neither
  candidate text colour clears the floor.
- The dark-mode lightness bias scale now applies only to positive bias. It
  exists to soften the *lightening* of warm hues; a hue biased downward is being
  deepened for legibility and needs no softening.
- `generate-scales.mjs` no longer computes its output at module scope, so
  importing it does not run the generator.

## [0.3.0] — 2026-08-26

### Added
- The signal register — a mono/uppercase/tracked label scale, with the rule that
  it is for text that is *scanned*, never text that is *read* (Charter 7.6–7.8).
- Geometry (Charter Article 5): four radii keyed to element size, and concentric
  nesting — `inner = outer − (padding + border)`, one level deep.
- `Code` and `CodeBlock`, plus a UI-level code treatment. Previously code was
  styled in prose only.
- Base-layer ownership of disabled, scrollbars, autofill and focus, so no
  component reinvents them (Charter 4.5).
- Charter 3.7–3.8: the ramps permit product-level composition; the system does
  not encode it.

### Changed
- The density rhythm ladder is now strictly 2× at every rung (16/32/64), from
  the rule that a gap between groups must be at least twice the gap inside one.

## [0.2.0] — 2026-08-26

### Changed
- The scale moved from 10 steps to **12, on Radix step semantics adopted
  verbatim**. The two extra steps replaced three border tokens that had been
  bolted on top of the old scale.
- Every semantic token now resolves to a ramp step. The semantic layer is
  written once for both themes; dark mode swaps the ramps, not the meanings.

### Added
- Canvas/surface pair with `raised` and `flat` looks.
- Density modes via `data-density`.
- Prose tokens and treatment.
- `CHARTER.md`.

### Fixed
- `--muted` measured 1.03:1 against the light canvas, making tab lists and
  secondary buttons effectively invisible in light mode while looking correct in
  dark. This produced the structural contrast floors in Charter 8.1.
- Data marks fell below 3:1 in light mode. Light charts now use step 11, whose
  contract is ≥4.5:1; dark stays at step 9 (D3).

## [0.1.0] — 2026-08-25

Initial system: neutral-dominant thesis, OKLCH ramps, the three colour jobs,
and distribution as a GitHub-hosted shadcn registry.

[0.5.0]: https://github.com/phugadev/minima/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/phugadev/minima/releases/tag/v0.4.0
[0.3.1]: https://github.com/phugadev/minima/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/phugadev/minima/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/phugadev/minima/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/phugadev/minima/releases/tag/v0.1.0
