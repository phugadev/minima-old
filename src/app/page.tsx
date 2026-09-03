"use client"

import * as React from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  Info,
  Layers,
  Minus,
  Moon,
  Search,
  Square,
  Sun,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, CodeBlock } from "@/components/minima/code"
import { Kbd } from "@/components/minima/kbd"
import { Note, NoteTitle } from "@/components/minima/note"
import { Stat, StatDelta, StatLabel, StatValue } from "@/components/minima/stat"
import { Status } from "@/components/minima/status"

import { VERSION } from "@/lib/version"

/* ───────────────────────────────────────────────────────────────────────────
   Page scaffolding
   ─────────────────────────────────────────────────────────────────────── */

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-14">
      <div className="mb-8 max-w-2xl">
        <p className="label-eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-lg">{title}</h2>
        {intro ? (
          <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Panel({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface ${className}`}>
      {children}
    </div>
  )
}

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

const HUES = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "pink",
] as const

const STEP_MEANING: Record<number, string> = {
  1: "App background",
  2: "Subtle background",
  3: "Element background",
  4: "Hovered element",
  5: "Active / selected",
  6: "Subtle border",
  7: "Element border",
  8: "Hovered border",
  9: "Solid",
  10: "Hovered solid",
  11: "Low-contrast text",
  12: "High-contrast text",
}

/* Which step each semantic role is drawn from — the map that keeps the
   vocabulary from drifting. */
const ROLE_MAP: [string, string][] = [
  ["1", "surface (flat) · canvas (dark raised)"],
  ["2", "canvas (light raised) · surface (dark raised)"],
  ["3", "--fill · --muted · {tone}-subtle"],
  ["4", "--fill-hover · --accent"],
  ["5", "--fill-active"],
  ["6", "--border · {tone}-border"],
  ["7", "--border-strong · --input"],
  ["8", "--border-active"],
  ["9", "--primary is gray-12; {tone} · --ring · dark charts"],
  ["10", "{tone}-hover · --subtle-foreground · light charts"],
  ["11", "--muted-foreground · {tone}-text · --prose-body"],
  ["12", "--foreground · --primary · --prose-strong"],
]

function Ramp({ hue }: { hue: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="w-12 shrink-0 text-2xs text-muted-foreground">{hue}</p>
      <div className="grid min-w-0 flex-1 grid-cols-12 gap-1">
        {STEPS.map((step) => (
          <button
            key={step}
            type="button"
            title={`--${hue}-${step} · ${STEP_MEANING[step]}`}
            className="h-7 rounded-sm border border-border/60 transition-transform hover:scale-110"
            style={{ background: `var(--${hue}-${step})` }}
          />
        ))}
      </div>
    </div>
  )
}

const TONES = ["success", "warning", "danger", "info"] as const

/* ───────────────────────────────────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────────────────────────────── */

export default function Page() {
  const [dark, setDark] = React.useState(false)
  const [raised, setRaised] = React.useState(true)
  const [density, setDensity] =
    React.useState<"compact" | "default" | "comfortable">("default")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  React.useEffect(() => {
    document.documentElement.dataset.surface = raised ? "raised" : "flat"
  }, [raised])

  React.useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])

  const install = "npx shadcn@latest add phugadev/minima/minima"

  function copyInstall() {
    navigator.clipboard.writeText(install)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">Minima</span>
            <span className="text-2xs text-subtle-foreground" data-numeric="">
              v{VERSION}
            </span>
          </div>
          <nav className="ml-4 hidden gap-4 text-xs text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#ramp">Ramp</a>
            <a className="hover:text-foreground" href="#surfaces">Surfaces</a>
            <a className="hover:text-foreground" href="#density">Density</a>
            <a className="hover:text-foreground" href="#type">Type</a>
            <a className="hover:text-foreground" href="#geometry">Geometry</a>
            <a className="hover:text-foreground" href="#inline">Inline</a>
            <a className="hover:text-foreground" href="#state">State</a>
            <a className="hover:text-foreground" href="#identity">Identity</a>
            <a className="hover:text-foreground" href="#data">Data</a>
            <a className="hover:text-foreground" href="#components">Components</a>
            <a className="hover:text-foreground" href="#install">Install</a>
            <a className="hover:text-foreground" href="/charter.html">Charter</a>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setRaised((r) => !r)}
            >
              {raised ? <Layers /> : <Square />}
              {raised ? "Raised" : "Flat"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle theme"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative py-20">
          <div className="pointer-events-none absolute inset-0 grid-field opacity-60" />
          <div className="relative max-w-2xl">
            <Status tone="neutral">Design system</Status>
            <h1 className="mt-5 text-4xl tracking-tight">Minima</h1>
            <p className="mt-4 text-base text-muted-foreground">
              A neutral-dominant design system. Neutral carries every bit of
              structure, hierarchy and weight. Colour is spent on exactly three
              jobs — and never on decoration.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "State",
                  d: "success · warning · danger · info",
                },
                { n: "02", t: "Identity", d: "one hue: links, focus, selection" },
                { n: "03", t: "Data", d: "a six-step categorical ramp" },
              ].map((job) => (
                <Panel key={job.n} className="p-4">
                  <p className="text-2xs text-subtle-foreground" data-numeric="">
                    {job.n}
                  </p>
                  <p className="mt-1.5 text-sm font-medium">{job.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{job.d}</p>
                </Panel>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button onClick={copyInstall}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy install command"}
              </Button>
              <Button variant="outline" nativeButton={false} render={<a href="#components" />}>
                Browse components
              </Button>
            </div>
          </div>
        </div>

        {/* ── Neutral ──────────────────────────────────────────────────── */}
        {/* ── Spectral ramp ───────────────────────────────────────────── */}
        <Section
          id="ramp"
          eyebrow="Foundation"
          title="The spectral ramp"
          intro="Thirteen ramps of twelve steps, generated in OKLCH on Radix step semantics — adopted verbatim rather than invented, because a shared vocabulary is only worth having if it is the one everyone else already speaks."
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <Panel className="space-y-2 p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="w-12 shrink-0" />
                <div className="grid min-w-0 flex-1 grid-cols-12 gap-1">
                  {STEPS.map((step) => (
                    <span
                      key={step}
                      className="text-center text-2xs text-subtle-foreground"
                      data-numeric=""
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
              {HUES.map((hue) => (
                <Ramp key={hue} hue={hue} />
              ))}
            </Panel>

            <div className="space-y-4">
              <div>
                <p className="label-eyebrow mb-2">A step number means one thing</p>
                <Panel className="divide-y divide-border">
                  {STEPS.map((step) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 px-3 py-1.5 text-2xs"
                    >
                      <span className="w-8 text-subtle-foreground" data-numeric="">
                        {step}
                      </span>
                      <span className="text-muted-foreground">
                        {STEP_MEANING[step]}
                      </span>
                    </div>
                  ))}
                </Panel>
              </div>
              <Note icon={<Info />}>
                Raw material, not a licence. The ramps exist so the state,
                identity and data tokens have somewhere principled to come
                from — reaching past a semantic token into a raw ramp should
                feel like the exception it is.
              </Note>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Perceptual, not nominal",
                "OKLCH lightness matches how the eye reads it, so a 400 border weighs the same in every hue. In hex it would not.",
              ],
              [
                "Wide gamut by default",
                "Chroma is pushed past the sRGB boundary on purpose. Saturated steps render wide on a P3 display and are gamut-mapped down everywhere else — one palette, two gamuts.",
              ],
              [
                "Honest where it has to bend",
                "Only steps 700–800 carry a per-hue lightness bias, because amber at blue\u2019s lightness is brown. Text steps stay on the shared track, so accessible amber text is — correctly — brown.",
              ],
              [
                "Generated, not curated",
                "One generator owns every value, in the CSS and in the registry alike. Retuning a hue is an edit to a chroma curve, not a hand-audit of 312 values.",
              ],
            ].map(([t, d]) => (
              <Panel key={t} className="p-4">
                <p className="text-sm font-medium">{t}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{d}</p>
              </Panel>
            ))}
          </div>
          <div className="mt-6">
            <p className="label-eyebrow mb-3">
              Where the semantic layer draws from
            </p>
            <Panel className="divide-y divide-border sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
              {ROLE_MAP.map(([step, roles]) => (
                <div
                  key={step}
                  className="flex items-baseline gap-3 border-border px-3 py-2 text-2xs sm:border-b sm:not-last:border-r"
                >
                  <span
                    className="w-5 shrink-0 text-subtle-foreground"
                    data-numeric=""
                  >
                    {step}
                  </span>
                  <code className="min-w-0 text-muted-foreground">{roles}</code>
                </div>
              ))}
            </Panel>
            <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
              Steps 11 and 12 are the scale&rsquo;s two text steps. Minima uses
              a third level for meta, drawn from step 10 — a documented
              extension, not something the scale defines as text. It clears
              3:1 and is never used for body copy.
            </p>
          </div>
        </Section>

        {/* ── Surfaces ─────────────────────────────────────────────────── */}
        <Section
          id="surfaces"
          eyebrow="Foundation"
          title="Canvas and surface"
          intro="Two backgrounds, split the way Geist splits them: one is the page backdrop, the other is what a component sits on. Whether they differ is a look, not a rewrite — components only ever reference the two tokens."
        >
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button
              variant={raised ? "default" : "outline"}
              size="sm"
              onClick={() => setRaised(true)}
            >
              Raised
            </Button>
            <Button
              variant={raised ? "outline" : "default"}
              size="sm"
              onClick={() => setRaised(false)}
            >
              Flat
            </Button>
            <span className="ml-1 text-xs text-muted-foreground">
              {raised
                ? "Canvas is off-white; surfaces lift to white."
                : "Canvas and surfaces match; hairlines do all the work."}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="label-eyebrow mb-3">The two tokens</p>
              <Panel className="divide-y divide-border">
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="size-6 rounded-sm border border-border bg-canvas" />
                    <span className="text-sm">Canvas</span>
                  </div>
                  <code className="text-2xs text-subtle-foreground">--canvas</code>
                </div>
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="size-6 rounded-sm border border-border bg-surface" />
                    <span className="text-sm">Surface</span>
                  </div>
                  <code className="text-2xs text-subtle-foreground">--surface</code>
                </div>
              </Panel>
              <p className="mt-3 text-xs text-muted-foreground">
                In dark mode the pair swaps role rather than meaning: raised
                surfaces sit <em>lighter</em> than the canvas, so the same
                token still means &ldquo;the thing a component sits on&rdquo;.
              </p>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Fills above the surface</p>
              <div className="nest nest-panel border border-border bg-surface">
                <div className="nested border border-border bg-fill p-3">
                  <div className="rounded-xs border border-border bg-fill-hover p-3">
                    <div className="rounded-xs border border-border bg-fill-active p-3 text-2xs text-muted-foreground">
                      fill-active
                    </div>
                    <p className="mt-2 text-2xs text-subtle-foreground">fill-hover</p>
                  </div>
                  <p className="mt-2 text-2xs text-subtle-foreground">fill</p>
                </div>
                <p className="mt-2 text-2xs text-subtle-foreground">surface</p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Steps 3, 4 and 5 — element, hovered, active. They are the
                interaction states of a fill, so using them as nesting depth
                is borrowing; needing a fourth means the layout nests too deep.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="label-eyebrow mb-3">Text — three levels, no more</p>
            <Panel className="divide-y divide-border md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex items-baseline justify-between gap-3 p-3">
                <span className="text-foreground">Primary</span>
                <code className="text-2xs text-subtle-foreground">gray-1000</code>
              </div>
              <div className="flex items-baseline justify-between gap-3 p-3">
                <span className="text-muted-foreground">Secondary</span>
                <code className="text-2xs text-subtle-foreground">gray-900</code>
              </div>
              <div className="flex items-baseline justify-between gap-3 p-3">
                <span className="text-subtle-foreground">Tertiary</span>
                <code className="text-2xs text-subtle-foreground">gray-800</code>
              </div>
            </Panel>
          </div>
        </Section>

        {/* ── Density ──────────────────────────────────────────────────── */}
        <Section
          id="density"
          eyebrow="Foundation"
          title="Density"
          intro="Spacing inherits Tailwind's 4px rhythm — there is no reason to reinvent it. What Minima adds is control geometry and three rhythm tokens, so density is one attribute on <html> rather than a thousand call-site decisions."
        >
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {(["compact", "default", "comfortable"] as const).map((d) => (
              <Button
                key={d}
                variant={density === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDensity(d)}
                className="capitalize"
              >
                {d}
              </Button>
            ))}
            <code className="ml-1 text-2xs text-subtle-foreground">
              data-density=&ldquo;{density}&rdquo;
            </code>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="label-eyebrow mb-3">Control heights</p>
              <Panel className="divide-y divide-border">
                {(
                  [
                    ["xs", "--control-xs"],
                    ["sm", "--control-sm"],
                    ["md", "--control-md"],
                    ["lg", "--control-lg"],
                  ] as const
                ).map(([k, token]) => (
                  <div key={k} className="flex items-center gap-3 p-3">
                    <span className="w-6 text-2xs text-subtle-foreground">{k}</span>
                    <div
                      className="flex-1 rounded-md border border-border bg-fill transition-all"
                      style={{ height: `var(${token})` }}
                    />
                    <code className="text-2xs text-subtle-foreground">{token}</code>
                  </div>
                ))}
              </Panel>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Rhythm</p>
              <Panel className="p-3">
                {(
                  [
                    ["gutter", "--gutter", "inside a container"],
                    ["stack", "--stack", "between sibling blocks"],
                    ["section", "--section", "between page sections"],
                  ] as const
                ).map(([k, token, note]) => (
                  <div key={k} className="flex items-center gap-3 py-1.5">
                    <span className="w-14 text-2xs text-muted-foreground">{k}</span>
                    <div
                      className="h-2 rounded-xs bg-accent-hue-subtle ring-1 ring-accent-hue-border transition-all"
                      style={{ width: `var(${token})` }}
                    />
                    <span className="text-2xs text-subtle-foreground">{note}</span>
                  </div>
                ))}
              </Panel>
              <p className="mt-3 text-xs text-muted-foreground">
                Three rhythm tokens, not a dozen. If a gap is none of these,
                the question is usually whether the block belongs where it is.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="label-eyebrow mb-3">The same controls, live</p>
            <Panel className="flex flex-wrap items-end gap-3 p-5">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Input placeholder="Input" className="w-40" />
              <Status tone="success">Operational</Status>
            </Panel>
          </div>
        </Section>

        {/* ── Typography ───────────────────────────────────────────────── */}
        <Section
          id="type"
          eyebrow="Foundation"
          title="Typography"
          intro="Two registers. UI text is small, tight and dense; prose is larger, looser and capped in ch so the measure tracks the font rather than the viewport."
        >
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="label-eyebrow mb-3">UI scale</p>
              <Panel className="divide-y divide-border">
                {(
                  [
                    ["2xs", "11", "meta, table density"],
                    ["xs", "12", "labels, captions"],
                    ["sm", "13", "UI default"],
                    ["base", "14", "UI body"],
                    ["lg", "16", "prose body"],
                    ["xl", "20", ""],
                    ["2xl", "24", ""],
                    ["3xl", "32", ""],
                  ] as const
                ).map(([k, px, note]) => (
                  <div key={k} className="flex items-baseline gap-3 px-3 py-2">
                    <code className="w-10 shrink-0 text-2xs text-subtle-foreground">
                      {k}
                    </code>
                    <span
                      className="w-8 shrink-0 text-2xs text-subtle-foreground"
                      data-numeric=""
                    >
                      {px}
                    </span>
                    <span className="truncate text-2xs text-muted-foreground">
                      {note}
                    </span>
                  </div>
                ))}
              </Panel>
              <p className="mt-3 text-xs text-muted-foreground">
                Numbers are always mono and tabular, at every size, via{" "}
                <code className="text-2xs">data-numeric</code>.
              </p>

              <p className="label-eyebrow mt-6 mb-3">Signal register</p>
              <Panel className="divide-y divide-border">
                <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
                  <span className="label-xs">Label xs</span>
                  <code className="text-2xs text-subtle-foreground">10 · 0.14em</code>
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
                  <span className="label-sm">Label sm</span>
                  <code className="text-2xs text-subtle-foreground">11 · 0.10em</code>
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
                  <span className="label-md">Label md</span>
                  <code className="text-2xs text-subtle-foreground">12 · 0.07em</code>
                </div>
              </Panel>
              <p className="mt-3 text-xs text-muted-foreground">
                Smaller sizes take more tracking, because uppercase letterforms
                crowd as they shrink.
              </p>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Prose</p>
              <Panel className="p-6">
                <article className="prose">
                  <h2>Body text is muted on purpose</h2>
                  <p>
                    A page of long-form text sits at the{" "}
                    <code>--muted-foreground</code> level in both themes, so
                    reading it is calm rather than loud. Emphasis then has
                    somewhere to go: <strong>bold jumps to full contrast</strong>{" "}
                    — black on a light background, white on a dark one — which
                    makes it the strongest signal on the page rather than one
                    of several.
                  </p>
                  <p>
                    Links carry the identity hue and nothing else does.{" "}
                    <a href="#identity">This is a link</a>, and it is underlined
                    at a hairline weight that thickens on hover.
                  </p>
                  <blockquote>
                    The measure is capped at 68ch, not a pixel width, so it
                    tracks the font rather than the viewport.
                  </blockquote>
                  <p>
                    Inline <code>code</code> sits on the element fill with a
                    hairline, matching every other small container in the
                    system.
                  </p>
                </article>
              </Panel>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Panel className="p-4">
                  <p className="label-xs mb-2">Register &mdash; scanned</p>
                  <p className="text-xs text-muted-foreground">
                    Mono, uppercase, tracked. Eyebrows, column headers, token
                    names, metadata, keys, every numeral. Text the reader{" "}
                    <em>scans</em>.
                  </p>
                </Panel>
                <Panel className="p-4">
                  <p className="mb-2 text-xs font-medium text-foreground">
                    Register — read
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sans, sentence case. Everything the reader actually{" "}
                    <em>reads</em>. The moment a sentence wants the mono
                    register, the register is wrong.
                  </p>
                </Panel>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Geometry ─────────────────────────────────────────────────── */}
        <Section
          id="geometry"
          eyebrow="Foundation"
          title="Geometry"
          intro="Roundness is relative — a chip and a modal cannot share a radius and both look right. Four radii, keyed to element size, and one rule for what happens when they nest."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="label-eyebrow mb-3">Radius by element size</p>
              <Panel className="divide-y divide-border">
                {(
                  [
                    ["chip", "--radius-chip", "4px", "tags, pills, inline marks"],
                    ["control", "--radius-control", "6px", "buttons, inputs, selects"],
                    ["panel", "--radius-panel", "12px", "cards, panels"],
                    ["surface", "--radius-surface", "16px", "modals, sheets, slabs"],
                  ] as const
                ).map(([k, token, px, use]) => (
                  <div key={k} className="flex items-center gap-3 p-3">
                    <div
                      className="size-9 shrink-0 border border-border-strong bg-fill"
                      style={{ borderRadius: `var(${token})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{k}</p>
                      <p className="text-2xs text-subtle-foreground">{use}</p>
                    </div>
                    <code
                      className="text-2xs text-subtle-foreground"
                      data-numeric=""
                    >
                      {px}
                    </code>
                  </div>
                ))}
              </Panel>
            </div>

            <div>
              <p className="label-eyebrow mb-3">The nesting rule</p>
              <Panel className="p-5">
                <p className="mb-4 font-mono text-xs text-foreground">
                  inner = outer &minus; (padding + border)
                </p>
                <p className="text-xs text-muted-foreground">
                  A nested corner is not an independent radius placed inside
                  another — it is the same corner moved inward by the gap. The
                  two curves have to share a centre, or the eye reads the inner
                  one as a mistake even when it cannot say why.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  The border counts as part of the gap, not as decoration
                  outside it.
                </p>
              </Panel>
            </div>
          </div>

          <div className="mt-6">
            <p className="label-eyebrow mb-3">What the rule fixes</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="rounded-[16px] border border-border bg-surface p-1">
                  <div className="rounded-[16px] border border-border bg-fill p-3">
                    <p className="text-2xs text-muted-foreground">
                      inner radius 16px — same as the parent
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  <span className="text-foreground">Naive.</span> The inner
                  curve is rounder than the space it sits in, so the gap
                  pinches at the corners and opens along the edges.
                </p>
              </div>

              <div>
                <div className="nest nest-inset border border-border bg-surface">
                  <div className="nested border border-border bg-fill p-3">
                    <p className="text-2xs text-muted-foreground">
                      inner radius 12px — 16 − 4 − 1 + 1
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  <span className="text-foreground">Concentric.</span> The two
                  curves share a centre, so the gap stays even the whole way
                  around.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Note icon={<Info />}>
              <NoteTitle>One level, deliberately.</NoteTitle>
              With a 12px panel radius and a 16px gutter, the concentric answer
              is already a square corner — so a chain deeper than one step has
              nothing left to compute. A square inner corner is the rule
              working, not failing.
            </Note>
            <Note icon={<Info />}>
              <NoteTitle>The formula gets you concentric; the eye finishes it.</NoteTitle>
              At small radii a strictly concentric corner reads a little tight,
              so <code className="text-2xs">--nest-optical</code> adds a pixel
              back. Mathematically wrong, visibly right.
            </Note>
          </div>
        </Section>

        {/* ── Text-level foundations ───────────────────────────────────── */}
        <Section
          id="inline"
          eyebrow="Foundation"
          title="Inline and interactive"
          intro="The small things every interface needs and most systems leave to each component to reinvent — code, links, keys, disabled state, even the scrollbar."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="label-eyebrow mb-3">Code</p>
              <Panel className="p-5">
                <p className="text-sm text-muted-foreground">
                  Run <Code>npm run tokens</Code> to regenerate, then read{" "}
                  <Code>src/app/tokens.css</Code> to see what changed.
                </p>
                <CodeBlock className="mt-4" label="scripts/build-tokens.mjs">
{`const SEMANTIC = {
  foreground: "var(--gray-12)",
  border:     "var(--gray-6)",
}`}
                </CodeBlock>
                <p className="mt-3 text-xs text-muted-foreground">
                  Never coloured. Syntax highlighting is a product concern — a
                  system that tints code has quietly spent colour on a fourth
                  job.
                </p>
              </Panel>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Links and keys</p>
              <Panel className="space-y-4 p-5">
                <p className="text-sm text-muted-foreground">
                  A <a className="link" href="#identity">standard link</a>{" "}
                  carries the identity hue. A{" "}
                  <a className="link-quiet" href="#identity">quiet link</a>{" "}
                  reads as body text until you reach for it.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                  <span>to search</span>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <Kbd>⇧</Kbd>
                  <span>to multi-select</span>
                </div>
                <Separator />
                <div>
                  <p className="label-eyebrow mb-2">Disabled</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button disabled>Primary</Button>
                    <Button variant="outline" disabled>Outline</Button>
                    <Input placeholder="Disabled" className="w-32" disabled />
                  </div>
                  <p className="mt-2.5 text-xs text-muted-foreground">
                    One opacity token, applied at the base layer to anything
                    disabled — so no component invents its own.
                  </p>
                </div>
              </Panel>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [
                "Scrollbars are chrome",
                "Thin, neutral, theme-aware — never the accent. The overflow below has one.",
              ],
              [
                "Autofill is repainted",
                "Chrome paints autofilled inputs a fixed yellow that ignores every token. An inset shadow is the only way to take it back.",
              ],
              [
                "Code is mono without a class",
                "code, kbd, samp and pre take the mono register at the base layer, so it can never be forgotten.",
              ],
            ].map(([t, d]) => (
              <Panel key={t} className="p-4">
                <p className="text-sm font-medium">{t}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{d}</p>
              </Panel>
            ))}
          </div>
        </Section>

        {/* ── State ────────────────────────────────────────────────────── */}
        <Section
          id="state"
          eyebrow="Colour job 01"
          title="State"
          intro="Each state ships a six-part contract — solid, solid-hover, on-solid, text, subtle and border — so a tone can be applied to a fill, a text colour, a tint or a hairline without anyone inventing an opacity on the spot. The on-solid value is measured, not chosen: the generator picks whichever of white or near-black actually clears 4.5:1, and refuses to build a palette where neither does."
        >
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tone</TableHead>
                  <TableHead>Solid</TableHead>
                  <TableHead>On solid</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Subtle</TableHead>
                  <TableHead>Border</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TONES.map((tone) => (
                  <TableRow key={tone}>
                    <TableCell className="font-medium capitalize">{tone}</TableCell>
                    <TableCell>
                      <div
                        className="size-6 rounded-sm"
                        style={{ background: `var(--${tone})` }}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex h-6 items-center rounded-sm px-2 text-2xs font-medium"
                        style={{
                          background: `var(--${tone})`,
                          color: `var(--${tone}-foreground)`,
                        }}
                      >
                        Aa
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-2xs font-medium"
                        style={{ color: `var(--${tone}-text)` }}
                      >
                        Aa
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className="size-6 rounded-sm border"
                        style={{
                          background: `var(--${tone}-subtle)`,
                          borderColor: `var(--${tone}-border)`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="h-6 w-10 rounded-sm border-2"
                        style={{ borderColor: `var(--${tone}-border)` }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="label-eyebrow mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                <Status tone="success">Operational</Status>
                <Status tone="warning">Degraded</Status>
                <Status tone="danger">Incident</Status>
                <Status tone="info">Deploying</Status>
                <Status tone="neutral">Archived</Status>
                <Status tone="success" pulse>
                  Live
                </Status>
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Notes — neutral by default</p>
              <div className="space-y-2">
                <Note icon={<Info />}>
                  <NoteTitle>Neutral is the default tone.</NoteTitle>
                  Most messages are informational, not alarming.
                </Note>
                <Note tone="warning" icon={<TriangleAlert />}>
                  <NoteTitle>Escalate only for real state.</NoteTitle>
                  This one reports a condition the reader must act on.
                </Note>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <Section
          id="identity"
          eyebrow="Colour job 02"
          title="Identity"
          intro="One hue, applied to interaction affordances only: links, focus rings, text selection and the active item in a set. Primary buttons stay neutral — that restraint is what makes the accent legible when it does appear."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Panel className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">
                Read the{" "}
                <a
                  href="#install"
                  className="text-accent-hue-text underline decoration-accent-hue-border underline-offset-2 hover:decoration-current"
                >
                  installation guide
                </a>
                , then select this sentence to see the selection tint.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input placeholder="Focus me" className="w-44" />
                <Button variant="outline">Tab to me</Button>
              </div>
              <p className="text-xs text-subtle-foreground">
                Focus is a 2px ring in the identity hue at a 2px offset —
                the same treatment on every focusable element.
              </p>
            </Panel>

            <Panel className="p-5">
              <p className="label-eyebrow mb-3">Primary stays neutral</p>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">Extra small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon-sm" aria-label="Search">
                  <Search />
                </Button>
              </div>
            </Panel>
          </div>
        </Section>

        {/* ── Data ─────────────────────────────────────────────────────── */}
        <Section
          id="data"
          eyebrow="Colour job 03"
          title="Data"
          intro="Six categorical hues, re-derived rather than inverted for dark mode. Numbers are always mono and tabular so columns align and changing digits do not reflow the layout."
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div
                  className="h-12 rounded-md"
                  style={{ background: `var(--chart-${i})` }}
                />
                <p className="text-2xs text-subtle-foreground" data-numeric="">
                  chart-{i}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { l: "Requests", v: "1,284,902", d: "+12.4%", dir: "up" as const },
              { l: "p95 latency", v: "142ms", d: "−8.1%", dir: "up" as const },
              { l: "Error rate", v: "0.42%", d: "+0.09pp", dir: "down" as const },
              { l: "Uptime", v: "99.98%", d: "0.00pp", dir: "flat" as const },
            ].map((s) => (
              <Card key={s.l}>
                <CardContent>
                  <Stat>
                    <StatLabel>{s.l}</StatLabel>
                    <StatValue>{s.v}</StatValue>
                    <StatDelta direction={s.dir}>
                      {s.dir === "up" ? (
                        <ArrowUpRight className="size-3" />
                      ) : s.dir === "down" ? (
                        <ArrowDownRight className="size-3" />
                      ) : (
                        <Minus className="size-3" />
                      )}
                      {s.d}
                    </StatDelta>
                  </Stat>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Colour appears in exactly two places here: the status column and
                the delta column.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Traffic</TableHead>
                    <TableHead className="text-right">p95</TableHead>
                    <TableHead className="text-right">Δ 24h</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["api-gateway", "success", "412k", "88ms", "+2.1%", "up"],
                    ["auth", "success", "204k", "63ms", "+0.4%", "up"],
                    ["billing", "warning", "38k", "412ms", "−11.7%", "down"],
                    ["search", "danger", "96k", "1.8s", "−34.2%", "down"],
                    ["mailer", "neutral", "12k", "—", "0.0%", "flat"],
                  ].map(([name, tone, traffic, p95, delta, dir]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        <Status
                          tone={tone as "success" | "warning" | "danger" | "neutral"}
                        >
                          {tone === "success"
                            ? "Healthy"
                            : tone === "warning"
                              ? "Degraded"
                              : tone === "danger"
                                ? "Failing"
                                : "Idle"}
                        </Status>
                      </TableCell>
                      <TableCell className="text-right" data-numeric="">
                        {traffic}
                      </TableCell>
                      <TableCell className="text-right" data-numeric="">
                        {p95}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          dir === "up"
                            ? "delta-up"
                            : dir === "down"
                              ? "delta-down"
                              : "delta-flat"
                        }`}
                        data-numeric=""
                      >
                        {delta}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Section>

        {/* ── Components ───────────────────────────────────────────────── */}
        <Section
          id="components"
          eyebrow="Surface"
          title="Components"
          intro="Stock shadcn primitives, re-tuned entirely through tokens — plus four originals that encode the colour rules so they cannot be forgotten at call sites."
        >
          <Tabs defaultValue="controls">
            <TabsList>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="scales">Scales</TabsTrigger>
            </TabsList>

            <TabsContent value="controls">
              <Panel className="grid gap-6 p-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="env">Environment</Label>
                    <Select defaultValue="prod">
                      <SelectTrigger id="env" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prod">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="dev">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="label-eyebrow mb-2">Badges</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="ghost">Ghost</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="label-eyebrow mb-2">Keys</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Kbd>⌘</Kbd>
                      <Kbd>K</Kbd>
                      <span>to search</span>
                      <Separator orientation="vertical" className="mx-1 h-4" />
                      <Kbd>esc</Kbd>
                      <span>to close</span>
                    </div>
                  </div>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="feedback">
              <Panel className="space-y-4 p-5">
                <div className="space-y-3">
                  <Progress value={72}>
                    <ProgressLabel>Index rebuild</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                  <Progress value={28}>
                    <ProgressLabel>Backfill</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Note tone="success" icon={<Check />}>
                    <NoteTitle>Deploy succeeded</NoteTitle>
                    All twelve checks passed in 3m 14s.
                  </Note>
                  <Note tone="danger" icon={<TriangleAlert />}>
                    <NoteTitle>Migration failed</NoteTitle>
                    Rolled back to the previous revision automatically.
                  </Note>
                  <Note tone="info" icon={<Info />}>
                    <NoteTitle>Scheduled maintenance</NoteTitle>
                    Read replicas will cycle on Sunday at 02:00 UTC.
                  </Note>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="scales">
              <div className="grid gap-6 md:grid-cols-2">
                <Panel className="p-5">
                  <p className="label-eyebrow mb-4">Radius</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["xs", "2px"],
                      ["sm", "4px"],
                      ["md", "6px"],
                      ["lg", "8px"],
                      ["xl", "12px"],
                      ["2xl", "16px"],
                    ].map(([k, v]) => (
                      <div key={k} className="space-y-1.5">
                        <div
                          className="h-12 border border-border-strong bg-fill-hover"
                          style={{ borderRadius: v }}
                        />
                        <p className="text-2xs text-subtle-foreground" data-numeric="">
                          {k} · {v}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="p-5">
                  <p className="label-eyebrow mb-4">Elevation</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["xs", "sm", "md", "lg"].map((k) => (
                      <div key={k} className="space-y-1.5">
                        <div
                          className="h-12 rounded-lg border border-border bg-card"
                          style={{ boxShadow: `var(--elevation-${k})` }}
                        />
                        <p className="text-2xs text-subtle-foreground" data-numeric="">
                          shadow-{k}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    The hairline does most of the separating. Shadow is reserved
                    for things that genuinely float — popovers, dialogs, menus.
                  </p>
                </Panel>
              </div>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ── Install ──────────────────────────────────────────────────── */}
        <Section
          id="install"
          eyebrow="Distribution"
          title="Install"
          intro="Minima is published as a GitHub-hosted shadcn registry — the repository is the registry, so there is no server to run and no JSON to deploy. One command installs the token layer, the config and every component."
        >
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
              <span className="text-2xs text-subtle-foreground">
                Everything — tokens, config and components
              </span>
              <Button variant="ghost" size="xs" onClick={copyInstall}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 text-xs">{install}</pre>
          </Panel>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Tokens only", "phugadev/minima/minima-theme"],
              ["Status", "phugadev/minima/status"],
              ["Note", "phugadev/minima/note"],
              ["Stat", "phugadev/minima/stat"],
            ].map(([label, path]) => (
              <Panel
                key={path}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-sm">{label}</span>
                <code className="truncate text-2xs text-subtle-foreground">
                  {path}
                </code>
              </Panel>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Panel className="p-4">
              <p className="text-sm font-medium">Pin a version</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Append <code className="text-2xs">#ref</code> — a branch, tag
                or commit SHA — to install from a fixed point rather than the
                default branch.
              </p>
            </Panel>
            <Panel className="p-4">
              <p className="text-sm font-medium">Private repositories</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Set <code className="text-2xs">GH_TOKEN</code> to a
                fine-grained token scoped to the repo with{" "}
                <em>Contents: Read-only</em>.
              </p>
            </Panel>
          </div>

          <Note className="mt-6" icon={<Info />}>
            <NoteTitle>Confirm the GitHub handle before publishing.</NoteTitle>
            <code className="text-2xs">phugadev/minima</code> is a
            placeholder — it is set in{" "}
            <code className="text-2xs">scripts/build-registry.mjs</code>, which
            regenerates <code className="text-2xs">registry.json</code>.
          </Note>
        </Section>

        {/* ── Rules ────────────────────────────────────────────────────── */}
        <Section
          id="rules"
          eyebrow="Constitution"
          title="The rules"
          intro="A design system is only as good as the decisions it refuses to re-litigate."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "Neutral is the default",
                "If a colour is not reporting state, carrying identity or encoding data, it should be neutral.",
              ],
              [
                "Three text levels",
                "Primary, secondary, tertiary. A fourth level means the layout is doing too much.",
              ],
              [
                "Hairline before shadow",
                "Separation is a 1px border. Shadow is reserved for things that float.",
              ],
              [
                "Numbers are mono and tabular",
                "Always. Columns align, digits do not reflow.",
              ],
              [
                "Semantics resolve to ramp steps",
                "No token holds a loose colour value. Dark mode swaps the ramps, not the meanings — which is why both themes read the same source lines.",
              ],
              [
                "One accent hue",
                "Links, focus, selection, active. Adding a second accent is how neutral systems die.",
              ],
            ].map(([title, body]) => (
              <Panel key={title} className="p-4">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{body}</p>
              </Panel>
            ))}
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-2xs text-subtle-foreground">
          <span>Minima — a neutral-dominant design system</span>
          <span data-numeric="">v{VERSION}</span>
        </div>
      </footer>
    </div>
  )
}
