export type EmailPosition =
  | "ceo"
  | "hr_director"
  | "it_support"
  | "finance_trainee"
  | "sales_executive"
  | "report_trainee"

export interface EmailTypes {
  // General
  id: string
  sort: number | null
  name: string
  email: string
  position: EmailPosition
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
