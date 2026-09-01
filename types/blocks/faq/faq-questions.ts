export interface FaqQuestions {
  // General
  id: string
  sort: number | null
  question: string
  answer: string
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
