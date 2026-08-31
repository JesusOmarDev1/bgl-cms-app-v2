import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface BlogCategoriesTypes {
  // General
  id: string
  title: string
  slug: string | null
  icon: string | null
  sort: number | null
  parent: string | BlogCategoriesTypes | null
  image: string | DirectusFileTypes | null
  status: StatusType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
