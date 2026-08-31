import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const boxVariants = cva("group/box min-w-0", {
  variants: {
    variant: {
      transparent: "bg-transparent",
    },
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    variant: "transparent",
    size: "default",
  },
})

const boxBreakpoints = ["base", "sm", "md", "lg", "xl", "2xl"] as const

type BoxBreakpoint = (typeof boxBreakpoints)[number]

type ResponsiveValue<T> = T | Partial<Record<BoxBreakpoint, T>>

type BoxDisplay = "flex" | "inline-flex" | "grid" | "block"
type BoxOrientation = "horizontal" | "vertical"
type BoxAlign = "start" | "center" | "end" | "stretch" | "baseline"
type BoxJustify = "start" | "center" | "end" | "between" | "around" | "evenly"
type BoxWrap = "nowrap" | "wrap" | "wrap-reverse"
type BoxContentAlign =
  "start" | "center" | "end" | "between" | "around" | "evenly"
type BoxContentJustify =
  "start" | "center" | "end" | "between" | "around" | "evenly"
type BoxGridTrack = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type BoxRemSpacing = 0 | 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4

export type BoxProps = Omit<
  React.ComponentProps<"div">,
  "className" | "align"
> &
  VariantProps<typeof boxVariants> & {
    className?: string
    display?: ResponsiveValue<BoxDisplay>
    orientation?: ResponsiveValue<BoxOrientation>
    align?: ResponsiveValue<BoxAlign>
    justify?: ResponsiveValue<BoxJustify>
    contentAlign?: ResponsiveValue<BoxContentAlign>
    contentJustify?: ResponsiveValue<BoxContentJustify>
    wrap?: ResponsiveValue<BoxWrap>
    cols?: ResponsiveValue<BoxGridTrack>
    rows?: ResponsiveValue<BoxGridTrack>
    gap?: ResponsiveValue<BoxRemSpacing>
    padding?: ResponsiveValue<BoxRemSpacing>
    paddingTop?: ResponsiveValue<BoxRemSpacing>
    paddingBottom?: ResponsiveValue<BoxRemSpacing>
    paddingInline?: ResponsiveValue<BoxRemSpacing>
    margin?: ResponsiveValue<BoxRemSpacing>
    marginTop?: ResponsiveValue<BoxRemSpacing>
    marginBottom?: ResponsiveValue<BoxRemSpacing>
    marginInline?: ResponsiveValue<BoxRemSpacing>
    render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode
  }

const boxBreakpointPrefixes: Record<BoxBreakpoint, string> = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
  "2xl": "2xl:",
}

const boxDisplayClasses: Record<BoxDisplay, string> = {
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  block: "block",
}

const boxOrientationClasses: Record<BoxOrientation, string> = {
  horizontal: "flex-row",
  vertical: "flex-col",
}

const boxAlignClasses: Record<BoxAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
}

const boxJustifyClasses: Record<BoxJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
}

const boxContentAlignClasses: Record<BoxContentAlign, string> = {
  start: "content-start",
  center: "content-center",
  end: "content-end",
  between: "content-between",
  around: "content-around",
  evenly: "content-evenly",
}

const boxWrapClasses: Record<BoxWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
}

const boxGridColsClasses: Record<BoxGridTrack, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
}

const boxGridRowsClasses: Record<BoxGridTrack, string> = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
  7: "grid-rows-7",
  8: "grid-rows-8",
  9: "grid-rows-9",
  10: "grid-rows-10",
  11: "grid-rows-11",
  12: "grid-rows-12",
}

// Rem scale: 0→0, 0.25→1, 0.5→2, 0.75→3, 1→4, 1.5→6, 2→8, 3→12, 4→16.
// Keep in sync with @source inline in app/globals.css.
const boxPaddingClasses: Record<BoxRemSpacing, string> = {
  0: "p-0",
  0.25: "p-1",
  0.5: "p-2",
  0.75: "p-3",
  1: "p-4",
  1.5: "p-6",
  2: "p-8",
  3: "p-12",
  4: "p-16",
}

const boxPaddingTopClasses: Record<BoxRemSpacing, string> = {
  0: "pt-0",
  0.25: "pt-1",
  0.5: "pt-2",
  0.75: "pt-3",
  1: "pt-4",
  1.5: "pt-6",
  2: "pt-8",
  3: "pt-12",
  4: "pt-16",
}

const boxPaddingBottomClasses: Record<BoxRemSpacing, string> = {
  0: "pb-0",
  0.25: "pb-1",
  0.5: "pb-2",
  0.75: "pb-3",
  1: "pb-4",
  1.5: "pb-6",
  2: "pb-8",
  3: "pb-12",
  4: "pb-16",
}

const boxPaddingInlineClasses: Record<BoxRemSpacing, string> = {
  0: "px-0",
  0.25: "px-1",
  0.5: "px-2",
  0.75: "px-3",
  1: "px-4",
  1.5: "px-6",
  2: "px-8",
  3: "px-12",
  4: "px-16",
}

const boxMarginClasses: Record<BoxRemSpacing, string> = {
  0: "m-0",
  0.25: "m-1",
  0.5: "m-2",
  0.75: "m-3",
  1: "m-4",
  1.5: "m-6",
  2: "m-8",
  3: "m-12",
  4: "m-16",
}

const boxMarginTopClasses: Record<BoxRemSpacing, string> = {
  0: "mt-0",
  0.25: "mt-1",
  0.5: "mt-2",
  0.75: "mt-3",
  1: "mt-4",
  1.5: "mt-6",
  2: "mt-8",
  3: "mt-12",
  4: "mt-16",
}

const boxMarginBottomClasses: Record<BoxRemSpacing, string> = {
  0: "mb-0",
  0.25: "mb-1",
  0.5: "mb-2",
  0.75: "mb-3",
  1: "mb-4",
  1.5: "mb-6",
  2: "mb-8",
  3: "mb-12",
  4: "mb-16",
}

const boxMarginInlineClasses: Record<BoxRemSpacing, string> = {
  0: "mx-0",
  0.25: "mx-1",
  0.5: "mx-2",
  0.75: "mx-3",
  1: "mx-4",
  1.5: "mx-6",
  2: "mx-8",
  3: "mx-12",
  4: "mx-16",
}

const boxGapClasses: Record<BoxRemSpacing, string> = {
  0: "gap-0",
  0.25: "gap-1",
  0.5: "gap-2",
  0.75: "gap-3",
  1: "gap-4",
  1.5: "gap-6",
  2: "gap-8",
  3: "gap-12",
  4: "gap-16",
}

function isResponsiveObject<T>(
  value: ResponsiveValue<T> | undefined
): value is Partial<Record<BoxBreakpoint, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFlexDisplay(value: BoxDisplay): boolean {
  return value === "flex" || value === "inline-flex"
}

function isGridDisplay(value: BoxDisplay): boolean {
  return value === "grid"
}

function isFlexOrGridDisplay(value: BoxDisplay): boolean {
  return isFlexDisplay(value) || isGridDisplay(value)
}

function resolveCascadedValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: BoxBreakpoint
): T | undefined {
  if (!isResponsiveObject(value)) {
    return value
  }

  const index = boxBreakpoints.indexOf(breakpoint)
  for (let i = index; i >= 0; i--) {
    const candidate = value[boxBreakpoints[i]]
    if (candidate !== undefined) {
      return candidate
    }
  }

  return undefined
}

function resolveDisplayValue(
  display: ResponsiveValue<BoxDisplay>,
  breakpoint: BoxBreakpoint
): BoxDisplay {
  return resolveCascadedValue(display, breakpoint) ?? "block"
}

function displayMatches(
  display: ResponsiveValue<BoxDisplay>,
  gate: (value: BoxDisplay) => boolean
): boolean {
  if (isResponsiveObject(display)) {
    return boxBreakpoints.some((breakpoint) =>
      gate(resolveDisplayValue(display, breakpoint))
    )
  }

  return gate(display)
}

function resolveResponsiveClasses<T extends string | number>(
  value: ResponsiveValue<T> | undefined,
  mapClass: (value: T) => string | undefined
): string[] {
  if (value === undefined) {
    return []
  }

  if (isResponsiveObject(value)) {
    const classes: string[] = []

    for (const breakpoint of boxBreakpoints) {
      const breakpointValue = value[breakpoint]
      if (breakpointValue === undefined) {
        continue
      }

      const className = mapClass(breakpointValue)
      if (!className) {
        continue
      }

      const prefix = boxBreakpointPrefixes[breakpoint]
      classes.push(prefix ? `${prefix}${className}` : className)
    }

    return classes
  }

  const className = mapClass(value)
  return className ? [className] : []
}

function resolveGatedResponsiveClasses<T extends string | number>(
  value: ResponsiveValue<T> | undefined,
  mapClass: (value: T) => string | undefined,
  display: ResponsiveValue<BoxDisplay>,
  gate: (displayValue: BoxDisplay) => boolean
): string[] {
  if (value === undefined) {
    return []
  }

  const classes: string[] = []
  let lastEmittedClass: string | undefined
  let wasGated = false

  for (const breakpoint of boxBreakpoints) {
    const displayValue = resolveDisplayValue(display, breakpoint)
    if (!gate(displayValue)) {
      wasGated = false
      lastEmittedClass = undefined
      continue
    }

    const resolvedValue = resolveCascadedValue(value, breakpoint)
    if (resolvedValue === undefined) {
      wasGated = true
      continue
    }

    const className = mapClass(resolvedValue)
    if (!className) {
      wasGated = true
      continue
    }

    if (wasGated && lastEmittedClass === className) {
      continue
    }

    const prefix = boxBreakpointPrefixes[breakpoint]
    classes.push(prefix ? `${prefix}${className}` : className)
    lastEmittedClass = className
    wasGated = true
  }

  return classes
}

function resolveDataAttribute<T extends string | number>(
  value: ResponsiveValue<T> | undefined
): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (isResponsiveObject(value)) {
    for (const breakpoint of boxBreakpoints) {
      const breakpointValue = value[breakpoint]
      if (breakpointValue !== undefined) {
        return String(breakpointValue)
      }
    }

    return undefined
  }

  return String(value)
}

function Box({
  className,
  variant = "transparent",
  size = "default",
  display = "block",
  orientation,
  contentAlign,
  contentJustify,
  align,
  justify,
  wrap,
  cols,
  rows,
  gap,
  padding,
  paddingTop,
  paddingBottom,
  paddingInline,
  margin,
  marginTop,
  marginBottom,
  marginInline,
  render,
  ...props
}: BoxProps) {
  const resolvedOrientation = displayMatches(display, isFlexDisplay)
    ? (orientation ?? "vertical")
    : orientation

  const resolvedClassName = cn(
    boxVariants({ variant, size }),
    resolveResponsiveClasses(display, (value) => boxDisplayClasses[value]),
    resolveGatedResponsiveClasses(
      resolvedOrientation,
      (value) => boxOrientationClasses[value],
      display,
      isFlexDisplay
    ),
    resolveGatedResponsiveClasses(
      align,
      (value) => boxAlignClasses[value],
      display,
      isFlexOrGridDisplay
    ),
    resolveGatedResponsiveClasses(
      justify,
      (value) => boxJustifyClasses[value],
      display,
      isFlexOrGridDisplay
    ),
    resolveGatedResponsiveClasses(
      wrap,
      (value) => boxWrapClasses[value],
      display,
      isFlexDisplay
    ),
    resolveGatedResponsiveClasses(
      cols,
      (value) => boxGridColsClasses[value],
      display,
      isGridDisplay
    ),
    resolveGatedResponsiveClasses(
      rows,
      (value) => boxGridRowsClasses[value],
      display,
      isGridDisplay
    ),
    resolveGatedResponsiveClasses(
      contentAlign,
      (value) => boxContentAlignClasses[value],
      display,
      isGridDisplay
    ),
    resolveResponsiveClasses(gap, (value) => boxGapClasses[value]),
    resolveResponsiveClasses(padding, (value) => boxPaddingClasses[value]),
    resolveResponsiveClasses(
      paddingTop,
      (value) => boxPaddingTopClasses[value]
    ),
    resolveResponsiveClasses(
      paddingBottom,
      (value) => boxPaddingBottomClasses[value]
    ),
    resolveResponsiveClasses(
      paddingInline,
      (value) => boxPaddingInlineClasses[value]
    ),
    resolveResponsiveClasses(margin, (value) => boxMarginClasses[value]),
    resolveResponsiveClasses(marginTop, (value) => boxMarginTopClasses[value]),
    resolveResponsiveClasses(
      marginBottom,
      (value) => boxMarginBottomClasses[value]
    ),
    resolveResponsiveClasses(
      marginInline,
      (value) => boxMarginInlineClasses[value]
    ),
    className
  )

  const dataAttributes = {
    "data-slot": "box",
    "data-display": resolveDataAttribute(display),
    "data-orientation": resolveDataAttribute(resolvedOrientation),
    "data-content-align": resolveDataAttribute(contentAlign),
    "data-content-justify": resolveDataAttribute(contentJustify),
    "data-align": resolveDataAttribute(align),
    "data-justify": resolveDataAttribute(justify),
    "data-size": size ?? undefined,
    "data-variant": variant ?? undefined,
  } as const

  if (render) {
    return render({
      ...dataAttributes,
      className: resolvedClassName,
      ...props,
    })
  }

  return <div {...dataAttributes} className={resolvedClassName} {...props} />
}

export { Box, boxVariants }
