import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Note — a bordered callout.
 *
 * The default tone is neutral on purpose: most notes are not alarming,
 * and reaching for colour by reflex is how a neutral system stops being one.
 * Escalate the tone only when the message genuinely reports state.
 */

const noteVariants = cva(
  "flex gap-3 rounded-lg border p-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-border bg-fill text-muted-foreground [&_svg]:text-subtle-foreground",
        success: "border-success-border bg-success-subtle text-success-text [&_svg]:text-success",
        warning: "border-warning-border bg-warning-subtle text-warning-text [&_svg]:text-warning",
        danger: "border-danger-border bg-danger-subtle text-danger-text [&_svg]:text-danger",
        info: "border-info-border bg-info-subtle text-info-text [&_svg]:text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

function Note({
  className,
  tone,
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof noteVariants> & { icon?: React.ReactNode }) {
  return (
    <div
      data-slot="note"
      data-tone={tone ?? "neutral"}
      className={cn(noteVariants({ tone }), className)}
      {...props}
    >
      {icon}
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
    </div>
  )
}

function NoteTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="note-title"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  )
}

export { Note, NoteTitle, noteVariants }
