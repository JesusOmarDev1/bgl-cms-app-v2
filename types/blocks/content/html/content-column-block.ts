import type { ContentEdgePadding } from "@/types/enums/content-edge-padding"

export interface ContentColumnBlock {
  // General
  id: string
  content: string | null
  sort: number | null
  title: string
  padding: ContentEdgePadding
  background_color: string
  padding_bottom: ContentEdgePadding
  padding_top: ContentEdgePadding
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
