import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Section — a region of the page, carrying the top rung of the rhythm ladder.
 *
 * Vertical space comes from `--section`, so density moves the page and not
 * just its controls. Before this existed the showcase spaced its own sections
 * with literals, which meant `data-density` resized every button on the page
 * and left the rhythm between regions exactly where it was.
 *
 * It is layout only. A heading block is content — pair it with `SectionHeader`
 * when a region needs one, and leave it out when it does not. Fusing the two
 * is what made the previous version unusable anywhere but the page it was
 * written for.
 */

const sectionVariants = cva("", {
  variants: {
    space: {
      none: "",
      section: "py-section",
      stack: "py-stack",
    },
    divided: {
      true: "border-t border-border",
      false: "",
    },
  },
  defaultVariants: { space: "section", divided: false },
})

function Section({
  className,
  space,
  divided,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ space, divided }), className)}
      {...props}
    />
  )
}

/**
 * SectionHeader — eyebrow, title and an optional lead, on the reading measure.
 *
 * The eyebrow is the signal register (Charter 7.6): it is scanned, not read.
 */
function SectionHeader({
  className,
  eyebrow,
  title,
  lead,
  ...props
}: React.ComponentProps<"div"> & {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
}) {
  return (
    <div
      data-slot="section-header"
      className={cn("mb-stack max-w-2xl", className)}
      {...props}
    >
      {eyebrow ? <p className="label-eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-2 text-lg">{title}</h2>
      {lead ? (
        <p className="mt-2 text-sm text-muted-foreground">{lead}</p>
      ) : null}
    </div>
  )
}

export { Section, SectionHeader, sectionVariants }
