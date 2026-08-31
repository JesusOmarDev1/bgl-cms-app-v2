export interface LogosClientsBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  clients: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
