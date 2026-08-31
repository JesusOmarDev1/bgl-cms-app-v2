import type { ProductsTypes } from "@/types/collections/products"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ProductsFilesJunction {
  id: number
  products_id: string | ProductsTypes
  directus_files_id: string | DirectusFileTypes
  sort: number | null
}
