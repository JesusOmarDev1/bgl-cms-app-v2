import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { SeoTypes } from "@/types/collections/seo"
import type { ManualCategoriesTypes } from "@/types/collections/manual-categories"
import type { ManualsBodyJunction } from "@/types/collections/junctions/manuals-body"

export interface ManualsTypes {
  // General
  id: string
  title: string
  status: StatusType
  excerpt: string | null
  slug: string | null
  seo: string | SeoTypes
  image: string | DirectusFileTypes | null
  manual_category: string | ManualCategoriesTypes
  yt_video: string | null
  body: number[] | ManualsBodyJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
