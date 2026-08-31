export type PhonePosition =
  | "ceo"
  | "hr_director"
  | "it_support"
  | "finance_trainee"
  | "sales_executive"
  | "report_trainee"

export interface PhoneTypes {
  // General
  id: string
  name: string
  phone: string
  sort: number | null
  position: PhonePosition
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
