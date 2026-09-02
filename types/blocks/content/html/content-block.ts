import type { ContentBlockContentJunction } from "@/types/collections/junctions/content-block-content"
import type { ContentBlockLayout } from "@/types/enums/content-block-layout"
import type { ContentBlockPadding } from "@/types/enums/content-block-padding"
import type { ContentEdgePadding } from "@/types/enums/content-edge-padding"

export interface ContentBlock {
  // General
  id: string
  sort: number | null
  title: string
  layout: ContentBlockLayout
  padding: ContentBlockPadding
  padding_top: ContentEdgePadding
  padding_bottom: ContentEdgePadding
  content: number[] | ContentBlockContentJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
