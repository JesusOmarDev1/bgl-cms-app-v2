import { StatusType } from "@/types/enums/status-type"

export interface PagesTypes {
  // General
  id: string
  title: string
  slug: string
  status: StatusType
  excerpt: string | null
  date_created: Date | string
  date_updated: Date | string
}
