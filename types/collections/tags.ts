import type { StatusType } from "@/types/enums/status-type"

export interface TagTypes {
  // General
  id: string
  title: string
  slug: string | null
  color: string
  status: StatusType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
