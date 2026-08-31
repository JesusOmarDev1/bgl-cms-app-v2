export interface CheckboxBlock {
  // General
  id: string
  identifier: string
  label: string
  required: boolean
  width: number
  default: string | null
  sort: number | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
