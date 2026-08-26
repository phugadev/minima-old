import { cn } from "@/lib/utils"

/**
 * Kbd — a keyboard key. Always neutral; a shortcut is not a state.
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-fill px-1.5",
        "font-mono text-2xs font-medium text-muted-foreground shadow-xs",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
