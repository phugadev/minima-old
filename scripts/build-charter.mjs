/**
 * Minima — Charter renderer
 *
 * CHARTER.md is the source. This emits docs/charter.html from it, styled in
 * Minima's own tokens, with the live spectral ramp drawn from the same
 * generator that produces the system.
 *
 * This script exists because the vendored HTML was, for one release, a
 * hand-maintained duplicate with no source — which is precisely the drift
 * Charter 9.1 forbids, sitting inside the document that forbids it.
 *
 * Structure comes from CHARTER.md's own conventions, not from a generic
 * markdown pass:
 *
 *   ## Article N — Title        a numbered article
 *   **N.M NORMATIVE.** …        a clause, tagged and citable
 *   **N.M RATIONALE.** …        a clause, tagged and arguable
 *   **Dn — Title** …            a documented deviation
 *   <!-- ramp -->               where the live scale is injected
 *
 * Everything inside a clause is ordinary markdown, rendered by `marked`.
 *
 * Run: node scripts/build-charter.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"

import { marked } from "marked"

import { rampVars, HUES, STEPS } from "./generate-scales.mjs"

const HUE_NAMES = ["gray", ...HUES.map((h) => h.name)]
const here = (p) => new URL(p, import.meta.url)

const md = (src) =>
  marked.parse(src.trim(), { async: false, gfm: true, breaks: false })

/* marked wraps a lone paragraph in <p>; inside a clause body that is what we
   want, but headings and stray wrappers are not. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/* ── Parse ────────────────────────────────────────────────────────────────
   Split on `## `, then interpret each section by what it is. */
function parse(source) {
  const [, title] = source.match(/^#\s+(.+)$/m) ?? [, "The Minima Charter"]
  const version = (source.match(/^\*(v[\d.]+)[^*]*\*$/m) ?? [, ""])[1]

  const sections = source
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const nl = chunk.indexOf("\n")
      return { heading: chunk.slice(0, nl).trim(), body: chunk.slice(nl + 1) }
    })

  const preamble = source
    .slice(source.indexOf("\n", source.indexOf("# ")) + 1, source.indexOf("\n## "))
    .replace(/^\*v[\d.][^\n]*\*$/m, "")
    .replace(/^---$/m, "")
    .trim()

  const articles = []
  let deviations = []
  let scope = ""

  for (const { heading, body } of sections) {
    const art = heading.match(/^Article (\d+)\s+[—-]\s+(.+)$/)
    if (art) {
      articles.push({
        n: art[1],
        title: art[2],
        clauses: parseClauses(body),
      })
      continue
    }
    if (/^Documented deviations/i.test(heading)) {
      deviations = parseDeviations(body)
      continue
    }
    if (/^Not yet in scope/i.test(heading)) {
      scope = body.replace(/^---$/m, "").trim()
    }
  }

  return { title, version, preamble, articles, deviations, scope }
}

/** `**N.M NORMATIVE.** body…` up to the next clause or the section end.
    The tag is optional in the source; an untagged clause defaults to
    normative rather than being silently dropped. */
function parseClauses(body) {
  const re = /^\*\*(\d+\.\d+)(?:\s+(NORMATIVE|RATIONALE))?\.?\*\*\s*/gm
  const out = []
  const marks = [...body.matchAll(re)]
  marks.forEach((m, i) => {
    const start = m.index + m[0].length
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length
    out.push({
      id: m[1],
      tag: (m[2] ?? "NORMATIVE").toLowerCase(),
      body: body.slice(start, end).replace(/^---$/m, "").trim(),
    })
  })
  return out
}

/** `**Dn — Title**` followed by prose, until the next deviation. */
function parseDeviations(body) {
  const re = /^\*\*(D\d+)\s+[—-]\s+(.+?)\*\*\s*$/gm
  const out = []
  const marks = [...body.matchAll(re)]
  const intro = marks.length ? body.slice(0, marks[0].index).trim() : body.trim()
  marks.forEach((m, i) => {
    const start = m.index + m[0].length
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length
    out.push({
      id: m[1],
      title: m[2].replace(/\.$/, ""),
      body: body.slice(start, end).replace(/^---$/m, "").trim(),
    })
  })
  return { intro: intro.replace(/^---$/m, "").trim(), items: out }
}

/* ── Render ─────────────────────────────────────────────────────────────── */

/* Tables and code blocks need their own scroll container so the page body
   never scrolls sideways. */
const wrapBlocks = (html) =>
  html
    .replace(/<table>/g, '<div class="tw"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, '<div class="install">$1</div>')

const clauseHtml = (c) => `      <div class="clause">
        <div class="clause-id">${c.id}</div>
        <div class="clause-body"><span class="tag tag-${c.tag === "normative" ? "norm" : "rat"}">${
  c.tag === "normative" ? "Normative" : "Rationale"
}</span>${wrapBlocks(md(c.body))}</div>
      </div>`

const articleHtml = (a) => `    <section class="article" id="a${a.n}">
      <div class="article-head"><span class="article-n">Art. ${a.n}</span><h2>${esc(
  a.title
)}</h2></div>
${a.clauses.map(clauseHtml).join("\n\n")}
    </section>`

const deviationHtml = (d) => `      <div class="dev">
        <h3><span class="did">${d.id}</span> ${esc(d.title)}</h3>
        ${wrapBlocks(md(d.body)).replace(
          /<p><strong>(Alternative rejected|Rejected):<\/strong>/g,
          '<p class="rejected"><strong>Rejected:</strong>'
        )}
      </div>`

const railHtml = (articles) => `    <p class="rail-title">Articles</p>
    <ol>
${articles
  .map(
    (a) =>
      `      <li><a href="#a${a.n}"><span class="n">${a.n}</span><span>${esc(
        a.title
      )}</span></a></li>`
  )
  .join("\n")}
    </ol>
    <div class="rail-sep"></div>
    <ol>
      <li><a href="#dev"><span class="n">D</span><span>Documented deviations</span></a></li>
      <li><a href="#scope"><span class="n">&mdash;</span><span>Not yet in scope</span></a></li>
    </ol>`

const rampDecls = (mode) =>
  Object.entries(rampVars(mode))
    .map(([k, v]) => `    --${k}: ${v};`)
    .join("\n")

function render(doc) {
  const css = readFileSync(here("charter.css"), "utf8")
  const light = rampDecls("light")
  const dark = rampDecls("dark")

  /* The preamble's opening paragraph is the standfirst. */
  const paras = doc.preamble.split(/\n\n+/)
  const standfirst = md(paras.join("\n\n"))

  return `<title>${esc(doc.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<style>
/* ── Minima's own ramps, generated from scripts/generate-scales.mjs ─────── */
:root {
${light}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${dark}
  }
}

:root[data-theme="dark"] {
${dark}
}

${css}
</style>

<header class="masthead">
  <div class="masthead-inner">
    <p class="eyebrow">Minima &middot; Constitution &middot; ${esc(doc.version)}</p>
    <h1>${esc(doc.title)}</h1>
    <div class="standfirst">${standfirst}</div>
    <dl class="status-grid">
      <div class="status-cell"><dt>Normative</dt><dd>Binding. Changing it needs Article&nbsp;10.</dd></div>
      <div class="status-cell"><dt>Rationale</dt><dd>Explains a decision. Arguable.</dd></div>
      <div class="status-cell"><dt>Deviation</dt><dd>A known departure. Settled.</dd></div>
      <div class="status-cell"><dt>Generated from</dt><dd>CHARTER.md</dd></div>
    </dl>
  </div>
</header>

<div class="shell">
  <nav class="rail" aria-label="Articles">
${railHtml(doc.articles)}
  </nav>

  <main>
${doc.articles.map(articleHtml).join("\n\n")}

    <section class="article" id="dev">
      <div class="article-head"><span class="article-n">Dev.</span><h2>Documented deviations</h2></div>
      <div class="dev-intro">${md(doc.deviations.intro)}</div>
${doc.deviations.items.map(deviationHtml).join("\n\n")}
    </section>

    <section class="article" id="scope">
      <div class="article-head"><span class="article-n">&mdash;</span><h2>Not yet in scope</h2></div>
      <div class="scope">${md(doc.scope)}</div>
    </section>
  </main>
</div>

<footer>
  <span>The Minima Charter &middot; ${esc(doc.version)}</span>
  <span>github.com/phugadev/minima</span>
</footer>

<script>
(function () {
  var hues = ${JSON.stringify(HUE_NAMES)};
  var steps = ${JSON.stringify(STEPS)};
  var grid = document.getElementById("ramp-grid");
  if (!grid) return;
  var html = '<div></div>';
  steps.forEach(function (s) { html += '<div class="ramp-head">' + s + '</div>'; });
  hues.forEach(function (h) {
    html += '<div class="ramp-name">' + h + '</div>';
    steps.forEach(function (s) {
      html += '<div class="sw" title="--' + h + '-' + s + '" style="background: var(--' + h + '-' + s + ')"></div>';
    });
  });
  grid.innerHTML = html;
})();
</script>
`
}

const source = readFileSync(here("../CHARTER.md"), "utf8")
const doc = parse(source)

if (!doc.articles.length) {
  throw new Error("No articles parsed from CHARTER.md — has the format changed?")
}

/* A clause that fails to parse would vanish from the rendered Charter without
   any error, which is how Article 10 went missing for one build. Count the
   markers in the source and refuse to write a document that lost any. */
const markers = (source.match(/^\*\*\d+\.\d+/gm) ?? []).length
const parsed = doc.articles.reduce((n, a) => n + a.clauses.length, 0)
if (markers !== parsed) {
  throw new Error(
    `Parsed ${parsed} clauses but CHARTER.md contains ${markers} markers. ` +
      `A clause is being dropped — check its formatting.`
  )
}

const html = render(doc).replace(
  /<!--\s*ramp\s*-->/,
  '<div class="ramp-wrap"><div class="ramp-grid" id="ramp-grid"></div></div>'
)

mkdirSync(here("../docs"), { recursive: true })
writeFileSync(here("../docs/charter.html"), html)

const clauses = doc.articles.reduce((n, a) => n + a.clauses.length, 0)
console.log(
  `wrote docs/charter.html — ${doc.articles.length} articles, ${clauses} clauses, ` +
    `${doc.deviations.items.length} deviations`
)
