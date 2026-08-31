import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ServicesCategoriesTypes {
  // General
  id: string
  sort: number | null
  title: string
  slug: string | null
  status: StatusType
  icon: string | null
  image: string | DirectusFileTypes | null
  parent: string | ServicesCategoriesTypes | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
