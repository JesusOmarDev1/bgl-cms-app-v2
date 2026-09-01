export interface DateBlock {
  // General
  id: string
  identifier: string
  label: string
  required: boolean
  width: number
  default: "datetime" | null
  hours: boolean
  sort: number | null
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
