export interface MapBlock {
  // General
  id: string
  sort: number | null
  title: string
  url_embed: string
  excerpt: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
