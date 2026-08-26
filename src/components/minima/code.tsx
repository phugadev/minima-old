import { cn } from "@/lib/utils"

/**
 * Code — inline code and code blocks.
 *
 * Always the mono register, never coloured. Syntax highlighting is a product
 * concern: a design system that tints code has quietly spent colour on a
 * fourth job, and Article 1 says there are three.
 */

function Code({ className, ...props }: React.ComponentProps<"code">) {
  return <code data-slot="code" className={cn("code", className)} {...props} />
}

/**
 * A block of code, optionally labelled. The label uses the signal register —
 * it is scanned for a filename or a language, never read.
 */
function CodeBlock({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"pre"> & { label?: React.ReactNode }) {
  if (!label) {
    return (
      <pre data-slot="code-block" className={cn("code-block", className)} {...props}>
        {children}
      </pre>
    )
  }

  return (
    <div
      data-slot="code-block-group"
      className={cn(
        "overflow-hidden rounded-panel border border-code-border bg-code-bg",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-code-border px-3 py-1.5">
        <span className="label-xs">{label}</span>
      </div>
      <pre
        className="overflow-x-auto p-gutter font-mono text-sm leading-normal text-code-foreground"
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}

export { Code, CodeBlock }
