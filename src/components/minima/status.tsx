import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Status — the canonical carrier of Minima's STATE colour job.
 *
 * A status is the one place a hue is allowed to appear without a chart
 * axis or a link underline nearby. Everything else stays neutral.
 */

const statusDotVariants = cva("inline-block size-1.5 shrink-0 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-subtle-foreground",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: { tone: "neutral", pulse: false },
})

function StatusDot({
  className,
  tone,
  pulse,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusDotVariants>) {
  return (
    <span
      data-slot="status-dot"
      className={cn(statusDotVariants({ tone, pulse }), className)}
      {...props}
    />
  )
}

const statusVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        success: "border-success-border bg-success-subtle text-success-text",
        warning: "border-warning-border bg-warning-subtle text-warning-text",
        danger: "border-danger-border bg-danger-subtle text-danger-text",
        info: "border-info-border bg-info-subtle text-info-text",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

function Status({
  className,
  tone = "neutral",
  dot = true,
  pulse = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusVariants> & { dot?: boolean; pulse?: boolean }) {
  return (
    <span
      data-slot="status"
      data-tone={tone}
      className={cn(statusVariants({ tone }), className)}
      {...props}
    >
      {dot ? <StatusDot tone={tone} pulse={pulse} /> : null}
      {children}
    </span>
  )
}

export { Status, StatusDot, statusVariants, statusDotVariants }
