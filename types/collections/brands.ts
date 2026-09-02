import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { BrandsModelsJunction } from "@/types/collections/junctions/brands-models"

export interface BrandsTypes {
  // General
  id: string
  title: string
  excerpt: string | null
  logo: string | DirectusFileTypes
  slug: string | null
  status: StatusType
  models: number[] | BrandsModelsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
