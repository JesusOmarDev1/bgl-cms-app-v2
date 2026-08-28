"use client"
import { CSSProperties } from "react"
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { HealthStatusType } from "@/types/enums/health-status"

interface HealthStatusChartProps {
  data: {
    status: HealthStatusType
    value: number
  }[]
}

const chartConfig = {
  ok: {
    label: "Tiempo de respuesta",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function HealthStatusChart({ data }: HealthStatusChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="chart13-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
          </linearGradient>
          <pattern
            id="chart13-stripe"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
          >
            <path
              d="M0,6 L6,0"
              stroke="var(--chart-1)"
              strokeWidth="0.8"
              opacity="0.15"
            />
          </pattern>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="status"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="min-w-40 gap-2.5"
              labelFormatter={(value) => (
                <div className="mb-0.5 border-b border-border/50 pb-2">
                  <span className="text-xs font-medium">{value}</span>
                </div>
              )}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs bg-(--color-bg)"
                      style={
                        {
                          "--color-bg": `var(--chart-${name})`,
                        } as CSSProperties
                      }
                    />
                    <span className="text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground tabular-nums">
                    {Number(value).toLocaleString()}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="natural"
          fill="url(#chart13-gradient)"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
