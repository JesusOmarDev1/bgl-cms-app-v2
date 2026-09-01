export interface ClientsBlock {
  // General
  id: string
  title: string
  excerpt: string | null
  sort: number | null
  clients: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
