import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface SuppliersTypes {
  // General
  id: string
  name: string
  status: StatusType
  active: boolean
  website: string | null
  slug: string | null
  logo: string | DirectusFileTypes | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
