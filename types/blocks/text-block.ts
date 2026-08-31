export interface TextBlock {
  // General
  id: string
  identifier: string
  label: string
  required: boolean
  width: number
  default: string | null
  sort: number | null
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
