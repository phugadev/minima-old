import { cn } from "@/lib/utils"

/**
 * Stat — a single metric.
 *
 * The value is mono + tabular so that columns of figures align and digit
 * changes do not reflow. The delta is the only coloured element, and it is
 * doing the DATA job.
 */

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-label"
      className={cn(
        "text-2xs font-medium uppercase tracking-[0.08em] text-subtle-foreground",
        className
      )}
      {...props}
    />
  )
}

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-value"
      data-numeric=""
      className={cn(
        "text-2xl font-medium tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

function StatDelta({
  className,
  direction = "flat",
  ...props
}: React.ComponentProps<"div"> & { direction?: "up" | "down" | "flat" }) {
  return (
    <div
      data-slot="stat-delta"
      data-numeric=""
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        direction === "up" && "delta-up",
        direction === "down" && "delta-down",
        direction === "flat" && "delta-flat",
        className
      )}
      {...props}
    />
  )
}

export { Stat, StatLabel, StatValue, StatDelta }
