export interface FaqBlock {
  // General
  id: string
  title: string
  sort: number | null
  excerpt: string
  questions: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
