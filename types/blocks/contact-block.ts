export interface ContactBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string
  emails: number[]
  phones: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
