import type { StatusType } from "@/types/enums/status-type"

export interface TagTypes {
  // General
  id: string
  title: string
  slug?: string
  color?: string | null
  status?: StatusType
  // Audit
  date_created?: Date | string
  date_updated?: Date | string
}
