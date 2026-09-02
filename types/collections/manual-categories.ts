import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ManualCategoriesTypes {
  // General
  id: string
  title: string
  slug: string | null
  status: StatusType
  icon: string | null
  parent: string | ManualCategoriesTypes | null
  image: string | DirectusFileTypes | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
