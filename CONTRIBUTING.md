# Contributing to Minima

## How we work

Five rules, learned by breaking them. Minima spent its first eight releases
discovering that a design system fails in a particular way: it becomes correct
internally, and tells nobody. The registry shipped components it did not
contain. The fonts existed in one app and no install. The Charter was rendered
into a folder nothing served. Each was found by inspection, months of releases
after it started being false.

**1. Rules come after the thing they govern.** Write a clause when a decision
has already been made under pressure and you want it to stop being re-argued.
A clause written in advance is a claim nobody has tested — Article 12 was
written in 0.6.0 and was true only inside the showcase until 0.8.0.

**2. No claim without a runner.** If a statement in `CHARTER.md`, `README.md`
or a pull request can be checked, ship the thing that checks it in the same
change. `audit-contrast.mjs` and `audit-registry.mjs` are what this looks like.
Prefer deriving a value over restating one: the version in the showcase header
reads from `package.json` because for eight releases it read `v0.1.0`.

**3. Distribution is exercised, not assumed.** The registry is the product. A
change to it is not done until it has been installed somewhere — a scratch
project is enough. The documented install command was broken for two releases
because nobody ran it.

**4. Something has to use it.** A design system cannot discover what it is
missing on its own. Layout primitives were absent for eight releases and the
gap surfaced by looking at another project, not by hitting it.

**5. Versions are earned.** Work accumulates under `[Unreleased]`. Most pull
requests bump nothing. Eight minor versions in eight days, most of them fixing
things that had never worked in released form, is churn that reads as drift.

**6. Read the source of truth before writing against it.** Not your memory of a
library — the library. `AGENTS.md` already says this about Next: the docs in
`node_modules` win over training data. It applies to every dependency. The
registry shipped bare `registryDependencies` for two releases, making the
documented install command fail outright, because they were written from
recollection of how the shadcn CLI resolves addresses instead of from its
resolver. Reading it took ten minutes and would have cost nothing to do first.

**7. Never restate what the repo already knows.** If a value exists somewhere
in the tree, derive it. The showcase header carried a literal `v0.1.0` through
eight releases and a second one hid in the footer — in a repository where the
tokens, the registry, the scales and the Charter are all generated precisely so
nothing has to be kept in sync by hand. A literal that duplicates a fact is a
bug with a delay on it. `npm run verify:literals` in CI is the runner for this
one.

This is working practice, not constitution. It carries no clause numbers, it is
not NORMATIVE, and changing it needs no amendment — which is the point. The
Charter governs the system; this governs how the system gets built, and the two
should not be the same document.

## Change flow

`main` is protected by convention: changes arrive through pull requests, not
direct commits. This is not ceremony — the Charter's amendment process
(Article 10.1) needs somewhere to be checked, and a PR is that place.

```
git checkout -b <type>/<short-description>
# ... work ...
npm run registry     # regenerate tokens + registry if either source changed
npm run audit        # Charter Article 8 — must pass before you open the PR
git push -u origin HEAD
gh pr create
```

Branch prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`.

CI runs types, lint, a generated-files-in-sync check, the build, and the
contrast audit on every PR. All of it has to be green.

## Versioning

Minima follows semantic versioning, and does so even though it is not
published to npm — the version is the promise the system makes to anything
built on it, and a design system breaks things exactly as hard as a library
does. A renamed token breaks a consumer's build the same way a renamed export
would.

What each bump means here:

| Bump | Meaning | Examples |
| --- | --- | --- |
| **major** | A consumer's existing usage stops working or silently changes meaning | A token removed or renamed · a token's meaning changed · step semantics changed · a NORMATIVE clause amended in a way that invalidates existing usage |
| **minor** | New capability, nothing existing invalidated | A token, component or utility added · a Charter clause added · values retuned while every Article 8 floor still holds |
| **patch** | Behaviour did not match the Charter and now does | A contrast floor was breached and is fixed · a generated file was stale · documentation |

The distinction that matters most: **retuning a value is minor, changing what a
token means is major.** Making `--danger` a deeper red is minor — every
consumer's danger button is still a danger button. Making `--danger` mean
"destructive action only" and introducing `--error` for states is major, even
though no hex changed.

A change that only fixes a mismatch between the system and its own Charter is a
patch, however visible it is. The on-solid fix in 0.3.1 recoloured every state
solid and was still a patch, because Article 8 had always said what the values
should be.

## Releasing

Work accumulates under `## [Unreleased]` in the changelog. A release turns that
heading into a version — which means most pull requests do not touch the
version at all, and the number keeps meaning something.

The bump belongs **in the pull request**, because CI checks that
`package.json` and `CHANGELOG.md` agree and `main` takes no direct commits
(Article 11.1):

```
# in the release PR
npm version <major|minor|patch> --no-git-tag-version
# CHANGELOG.md — rename [Unreleased] to [<version>] — <date>, add a fresh
# [Unreleased] above it, and update the link refs at the bottom
git commit -am "release: v<version>"
```

Only the tag is applied afterwards, on `main`, once the PR has merged — a tag
is not a commit, so this does not write to `main`:

```
git checkout main && git pull
git tag -a v<version> -m "v<version>"
git push origin v<version>
gh release create v<version> --notes-from-tag
```

`CHARTER.md` carries the same version as the package. They describe the same
system; two version lines would be one too many.

## Generated files

Never hand-edit these — the change will be reverted by the next regeneration,
and CI will fail before that:

| File | Owner |
| --- | --- |
| `src/app/scales.css` | `scripts/generate-scales.mjs` |
| `src/app/tokens.css` | `scripts/build-tokens.mjs` |
| `src/lib/version.ts` | `scripts/build-tokens.mjs` |
| `registry.json`, `public/r/*` | `scripts/build-tokens.mjs`, `shadcn build` |
| `public/charter.html` | `scripts/build-charter.mjs`, from `CHARTER.md` |
