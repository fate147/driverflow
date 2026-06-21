import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  )
>

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = React.useId().replace(/:/g, "")
  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs",
        className
      )}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  className,
  ...props
}: any) {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex min-w-[8rem] flex-col items-center gap-1 rounded-xl border p-2 shadow-xl",
        className
      )}
      {...props}
    />
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  ...props
}: any) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs",
        className
      )}
      {...props}
    />
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
