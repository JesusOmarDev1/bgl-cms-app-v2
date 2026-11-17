import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus/directus-file"

export interface ProductTypesTypes {
  // General
  id: string
  status: StatusType
  title: string
  slug: string
  image: string | DirectusFileTypes | null
  category: string | ProductCategoriesTypes
}
