import { Watermark as FormeWatermark } from "@formepdf/react"

import { usePdfcnTheme } from "@/components/pdf/theme-provider"
import { mergeFormeStyles } from "@/components/pdf/pdf-primitives"
import { resolveColor } from "@/lib/pdf-themes/resolve-color"
import type { PDFComponentProps } from "@/types/pdf-themes/pdf-components"

export type WatermarkPosition =
  "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"

/**
 * Diagonal watermark overlaid across the full page using absolute positioning.
 * Props - `text` | `opacity` | `fontSize` | `color` | `angle` | `position` | `fixed` | `style`
 * @see {@link PdfWatermarkProps}
 */
export interface PdfWatermarkProps extends Omit<PDFComponentProps, "children"> {
  text: string
  opacity?: number
  fontSize?: number
  color?: string
  angle?: number
  position?: WatermarkPosition
  /**
   * @default true
   */
  fixed?: boolean
  children?: never
}

const withOpacity = (color: string, opacity: number): string => {
  const match = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!match) {
    return color
  }

  const [, red, green, blue] = match
  return `rgba(${Number.parseInt(red, 16)}, ${Number.parseInt(green, 16)}, ${Number.parseInt(blue, 16)}, ${opacity})`
}

export const PdfWatermark = ({
  text,
  opacity = 0.15,
  fontSize = 60,
  color = "mutedForeground",
  angle = -45,
  style,
}: PdfWatermarkProps) => {
  const theme = usePdfcnTheme()
  const resolvedColor = resolveColor(color, theme.colors)

  return (
    <FormeWatermark
      text={text}
      angle={angle}
      color={withOpacity(resolvedColor, opacity)}
      fontSize={fontSize}
      style={mergeFormeStyles(style)}
    />
  )
}
