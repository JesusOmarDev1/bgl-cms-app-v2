import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface DivisionServicesTypes {
  // General
  id: string
  title: string
  slug: string | null
  image: string | DirectusFileTypes | null
  status: StatusType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
