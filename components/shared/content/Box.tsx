"use client"

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

const boxContentJustifyClasses: Record<BoxContentJustify, string> = {
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

const boxGridTrackScale: Record<BoxGridTrack, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "11",
  12: "12",
}

const boxRemScale: Record<BoxRemSpacing, string> = {
  0: "0",
  0.25: "1",
  0.5: "2",
  0.75: "3",
  1: "4",
  1.5: "6",
  2: "8",
  3: "12",
  4: "16",
}

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

type BoxProps = Omit<React.ComponentProps<"div">, "className" | "align"> &
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

function isResponsiveObject<T>(
  value: ResponsiveValue<T> | undefined
): value is Partial<Record<BoxBreakpoint, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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

function resolveRemSpacingClass(
  utility: "gap" | "p" | "pt" | "pb" | "px" | "m" | "mt" | "mb" | "mx",
  value: BoxRemSpacing
) {
  return `${utility}-${boxRemScale[value]}`
}

function Box({
  className,
  variant = "transparent",
  size = "default",
  display = "block",
  orientation = "vertical",
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
  const resolvedClassName = cn(
    boxVariants({ variant, size }),
    resolveResponsiveClasses(display, (value) => boxDisplayClasses[value]),
    resolveResponsiveClasses(
      orientation,
      (value) => boxOrientationClasses[value]
    ),
    resolveResponsiveClasses(align, (value) => boxAlignClasses[value]),
    resolveResponsiveClasses(justify, (value) => boxJustifyClasses[value]),
    resolveResponsiveClasses(wrap, (value) => boxWrapClasses[value]),
    resolveResponsiveClasses(
      cols,
      (value) => `grid-cols-${boxGridTrackScale[value]}`
    ),
    resolveResponsiveClasses(
      rows,
      (value) => `grid-rows-${boxGridTrackScale[value]}`
    ),
    resolveResponsiveClasses(gap, (value) =>
      resolveRemSpacingClass("gap", value)
    ),
    resolveResponsiveClasses(padding, (value) =>
      resolveRemSpacingClass("p", value)
    ),
    resolveResponsiveClasses(paddingTop, (value) =>
      resolveRemSpacingClass("pt", value)
    ),
    resolveResponsiveClasses(paddingBottom, (value) =>
      resolveRemSpacingClass("pb", value)
    ),
    resolveResponsiveClasses(paddingInline, (value) =>
      resolveRemSpacingClass("px", value)
    ),
    resolveResponsiveClasses(margin, (value) =>
      resolveRemSpacingClass("m", value)
    ),
    resolveResponsiveClasses(marginTop, (value) =>
      resolveRemSpacingClass("mt", value)
    ),
    resolveResponsiveClasses(marginBottom, (value) =>
      resolveRemSpacingClass("mb", value)
    ),
    resolveResponsiveClasses(marginInline, (value) =>
      resolveRemSpacingClass("mx", value)
    ),
    className
  )

  if (render) {
    const renderProps = {
      "data-slot": "box",
      "data-display": resolveDataAttribute(display),
      "data-orientation": resolveDataAttribute(orientation),
      "data-content-align": resolveDataAttribute(contentAlign),
      "data-content-justify": resolveDataAttribute(contentJustify),
      "data-align": resolveDataAttribute(align),
      "data-justify": resolveDataAttribute(justify),
      "data-size": size ?? undefined,
      "data-variant": variant ?? undefined,
      className: resolvedClassName,
      ...props,
    }

    return render(renderProps)
  }

  return (
    <div
      data-slot="box"
      data-display={resolveDataAttribute(display)}
      data-orientation={resolveDataAttribute(orientation)}
      data-align={resolveDataAttribute(align)}
      data-justify={resolveDataAttribute(justify)}
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
      className={resolvedClassName}
      {...props}
    />
  )
}

export { Box, boxVariants }
