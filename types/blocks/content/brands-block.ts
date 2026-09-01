export interface BrandsBlock {
  // General
  id: string
  title: string
  sort: number | null
  excerpt: string | null
  brands: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
