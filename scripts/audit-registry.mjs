/**
 * Minima — registry audit
 *
 * Charter 9.1 makes the generated files authoritative. It does not, on its own,
 * make them CORRECT: `npm run registry` will happily regenerate a registry that
 * ships the wrong components, and the in-sync check in CI will pass, because
 * output and source agree about the same mistake.
 *
 * This is the runner for the thing that check cannot see — that what the
 * registry ships is what the system defines.
 *
 * Run: node scripts/audit-registry.mjs
 */

import { readdirSync, existsSync } from "node:fs"

import registry from "../registry.json" with { type: "json" }

const OWNER = "phugadev"
const REPO = "minima"

const url = (p) => new URL(`../${p}`, import.meta.url)
const failures = []
const fail = (clause, message) => failures.push({ clause, message })

const items = new Map(registry.items.map((item) => [item.name, item]))

/* ── Addressing ─────────────────────────────────────────────────────────────
   Mirrors the CLI's own parser: it picks a registry from the SHAPE of the
   dependency string, and anything with fewer than three slash-separated
   segments is fetched from ui.shadcn.com rather than from here. A bare name
   that happens to match a local item is the failure mode this exists to catch
   — it does not error at build time, it errors on a stranger's machine.     */
const isQualified = (dep) => dep.split("#")[0].split("/").length >= 3
const itemName = (dep) => dep.split("#")[0].split("/").slice(2).join("/")

for (const item of registry.items) {
  for (const dep of item.registryDependencies ?? []) {
    if (isQualified(dep)) {
      const [owner, repo] = dep.split("/")
      if (owner !== OWNER || repo !== REPO) continue
      if (!items.has(itemName(dep))) {
        fail("9.6", `${item.name} depends on ${dep}, which this registry does not define.`)
      }
      continue
    }
    /* Bare: resolves upstream. Legitimate only for something Minima has
       deliberately chosen not to define. If we define it, we must ship it. */
    if (items.has(dep)) {
      fail(
        "9.6",
        `${item.name} depends on "${dep}" bare, so the CLI fetches it from ` +
          `ui.shadcn.com and never sees this registry's own item. ` +
          `Write it as ${OWNER}/${REPO}/${dep}.`
      )
    }
  }
}

/* ── Coverage ───────────────────────────────────────────────────────────────
   Article 12 is a claim about components, and a claim the registry does not
   ship is a claim only the showcase can keep. Every component in the tree is
   part of the system, so every component in the tree is shipped.            */
for (const dir of ["src/components/ui", "src/components/minima"]) {
  for (const file of readdirSync(url(dir))) {
    if (!file.endsWith(".tsx")) continue
    const path = `${dir}/${file}`
    const shipped = registry.items.some((item) =>
      (item.files ?? []).some((f) => f.path === path)
    )
    if (!shipped) {
      fail("12.7", `${path} is part of the system but no registry item ships it.`)
    }
  }
}

/* ── Files exist ────────────────────────────────────────────────────────────
   An item naming a file that is not there installs nothing and says nothing. */
for (const item of registry.items) {
  for (const file of item.files ?? []) {
    if (!existsSync(url(file.path))) {
      fail("9.6", `${item.name} ships ${file.path}, which does not exist.`)
    }
  }
}

if (failures.length) {
  console.error(`registry audit — ${failures.length} breach(es)\n`)
  for (const { clause, message } of failures) {
    console.error(`  [${clause}] ${message}`)
  }
  console.error("")
  process.exit(1)
}

const shipped = registry.items.filter((i) => i.type === "registry:ui").length
console.log(
  `registry audit — ${registry.items.length} items, ` +
    `${shipped} components shipped, every dependency addressed to this registry`
)
