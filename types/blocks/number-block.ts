export interface NumberBlock {
  // General
  id: string
  identifier: string
  label: string
  required: boolean
  width: number
  default: number | null
  min: number | null
  max: number | null
  sort: number | null
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
