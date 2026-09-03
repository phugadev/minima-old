import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Container — the horizontal frame: a measure, centred, with the gutter.
 *
 * The gutter is `--gutter`, so it moves with `data-density` like everything
 * else. The widths do not: a measure is a typographic decision, not a density
 * one. `prose` is the reading measure and exists because a column of body copy
 * stops being readable long before it stops fitting.
 */

const containerVariants = cva("mx-auto w-full px-gutter", {
  variants: {
    size: {
      prose: "max-w-2xl",
      default: "max-w-5xl",
      wide: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: { size: "default" },
})

function Container({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof containerVariants>) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  )
}

export { Container, containerVariants }
