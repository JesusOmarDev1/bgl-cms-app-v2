export type ContentBlockLayout = "one" | "two" | "three"
export type ContentBlockPadding = "default" | "none" | "compact" | "full_width"
export type ContentBlockEdgePadding = "default" | "none" | "lg" | "md" | "sm"

export interface ContentBlock {
  // General
  id: string
  sort: number | null
  title: string
  layout: ContentBlockLayout
  padding: ContentBlockPadding
  padding_top: ContentBlockEdgePadding
  padding_bottom: ContentBlockEdgePadding
  content: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
