export interface DivisionServicesBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  division_services: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
