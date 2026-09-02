# Contributing to Minima

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
| `registry.json`, `public/r/*` | `scripts/build-tokens.mjs`, `shadcn build` |
| `docs/charter.html` | `scripts/build-charter.mjs`, from `CHARTER.md` |
