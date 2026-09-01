export interface EmailBlock {
  // General
  id: string
  label: string
  identifier: string
  required: boolean
  width: number
  default: string | null
  sort: number | null
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
