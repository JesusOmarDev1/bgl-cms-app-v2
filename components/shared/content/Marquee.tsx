import { Children, type ComponentPropsWithoutRef } from "react"
import { cn } from "cn"
import { MarqueeAppear } from "@/components/shared/content/MarqueeAppear"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
  /**
   * Number of rows to split children into.
   * Alternates direction on each row (normal → reverse → normal…).
   * @default 1
   */
  rows?: number
  /**
   * Gap between rows when using multiple rows
   * @default "1rem"
   */
  rowGap?: string
  /**
   * Animation variant.
   * - "default": continuous CSS marquee scroll
   * - "appear": column-based cycling with fade-in/fade-out
   * @default "default"
   */
  variant?: "default" | "appear"
  /**
   * Number of columns for the "appear" variant.
   * @default 4
   */
  columnCount?: number
  /**
   * Ripple direction for the "appear" variant.
   * @default "ltr"
   */
  direction?: "ltr" | "rtl"
}

function MarqueeRow({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: Omit<MarqueeProps, "rows" | "rowGap">) {
  return (
    <div
      {...props}
      className={cn(
        "group flex [gap:var(--gap)] overflow-hidden p-2 [--duration:80s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
              "motion-reduce:animate-none": true,
            })}
            key={`marquee-row-copy-${vertical ? "vertical" : "horizontal"}-${reverse ? "reverse" : "forward"}-${i + 1}`}
          >
            {children}
          </div>
        ))}
    </div>
  )
}

export function Marquee({
  variant = "default",
  rows = 1,
  rowGap = "1.5rem",
  reverse = false,
  columnCount = 4,
  direction = "ltr",
  children,
  ...props
}: MarqueeProps) {
  if (variant === "appear") {
    return (
      <MarqueeAppear
        columnCount={columnCount}
        direction={direction}
        pauseOnHover={props.pauseOnHover}
        className={props.className}
      >
        {children}
      </MarqueeAppear>
    )
  }

  if (rows <= 1) {
    return (
      <MarqueeRow reverse={reverse} {...props}>
        {children}
      </MarqueeRow>
    )
  }

  const items = Children.toArray(children)
  const chunkSize = Math.ceil(items.length / rows)

  return (
    <div className="flex flex-col" style={{ gap: rowGap }}>
      {Array.from({ length: rows }, (_, rowIndex) => {
        const start = rowIndex * chunkSize
        const rowItems = items.slice(start, start + chunkSize)
        // Alternate direction: even rows follow `reverse`, odd rows flip it
        const isReversed = rowIndex % 2 === 0 ? reverse : !reverse

        return (
          <MarqueeRow
            key={`marquee-split-row-${rowIndex + 1}`}
            reverse={isReversed}
            {...props}
          >
            {rowItems}
          </MarqueeRow>
        )
      })}
    </div>
  )
}
