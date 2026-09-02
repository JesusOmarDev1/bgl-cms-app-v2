import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { SeoTypes } from "@/types/collections/seo"
import type { ServicesCategoriesTypes } from "@/types/collections/services-categories"
import type { ServicesBodyJunction } from "@/types/collections/junctions/services-body"

export interface ServicesTypes {
  // General
  id: string
  title: string
  slug: string | null
  status: StatusType
  excerpt: string | null
  seo: string | SeoTypes
  image: string | DirectusFileTypes | null
  service_category: string | ServicesCategoriesTypes
  body: number[] | ServicesBodyJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
