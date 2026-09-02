import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ProductCategoriesTypes {
  // General
  id: string
  image: string | DirectusFileTypes | null
  title: string
  slug: string | null
  status: StatusType
  icon: string | null
  parent: string | ProductCategoriesTypes | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
