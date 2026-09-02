import type { ProductsTypes } from "@/types/collections/products"
import type { TagTypes } from "@/types/collections/tags"

export interface ProductsTagsJunction {
  id: number
  products_id: string | ProductsTypes
  tags_id: string | TagTypes
}
