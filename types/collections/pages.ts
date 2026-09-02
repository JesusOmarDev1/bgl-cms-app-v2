import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { SeoTypes } from "@/types/collections/seo"
import type { PagesBodyJunction } from "@/types/collections/junctions/pages-body"

export interface PagesTypes {
  // General
  id: string
  title: string
  slug: string | null
  status: StatusType
  image: string | DirectusFileTypes | null
  seo: string | SeoTypes
  excerpt: string | null
  body: number[] | PagesBodyJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
