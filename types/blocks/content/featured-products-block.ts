export interface FeaturedProductsBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  products: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
