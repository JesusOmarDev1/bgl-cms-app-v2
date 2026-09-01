export interface SuppliersBlock {
  // General
  id: string
  title: string | null
  excerpt: string | null
  sort: number | null
  suppliers: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
