export interface PhoneBlock {
  // General
  id: string
  identifier: string
  label: string
  required: boolean
  width: number
  default: string | null
  sort: string
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
