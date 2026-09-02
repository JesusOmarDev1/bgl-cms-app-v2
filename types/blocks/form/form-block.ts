import type { StatusType } from "@/types/enums/status-type"
import type { FormBlockFieldsJunction } from "@/types/collections/junctions/form-block-fields"

export interface FormBlock {
  // General
  id: string
  title: string
  sort: number | null
  excerpt: string | null
  captcha: boolean
  status: StatusType | null
  icon: string | null
  fields: number[] | FormBlockFieldsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
