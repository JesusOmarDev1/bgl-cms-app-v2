export interface FeaturedServicesBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  services: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
