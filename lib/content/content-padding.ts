import type { BoxProps } from "@/components/shared/content/Box"
import type { ContentBlockPadding } from "@/types/enums/content-block-padding"
import type { ContentEdgePadding } from "@/types/enums/content-edge-padding"

type BoxRemSpacing = Extract<NonNullable<BoxProps["padding"]>, number>

export type ContentPaddingValue = ContentBlockPadding | ContentEdgePadding

// ponytail: Box spacing stops at 4rem, so lg uses that ceiling. full_width is inset 0; block width stays on the row component.
const contentPaddingSpacing = {
  default: 3,
  none: 0,
  compact: 1,
  full_width: 0,
  lg: 4,
  md: 2,
  sm: 1,
} as const satisfies Record<ContentPaddingValue, BoxRemSpacing>

export function contentPaddingToBox(value: ContentPaddingValue): BoxRemSpacing {
  return contentPaddingSpacing[value]
}
