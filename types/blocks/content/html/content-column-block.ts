export type ContentColumnPadding = "default" | "none" | "lg" | "md" | "sm"

export interface ContentColumnBlock {
  // General
  id: string
  content: string | null
  sort: number | null
  title: string
  padding: ContentColumnPadding
  background_color: string
  padding_bottom: ContentColumnPadding
  padding_top: ContentColumnPadding
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
