import type { ProductsTypes } from "@/types/collections/products"

export interface ProductsProductsJunction {
  id: number
  products_id: string | ProductsTypes
  related_products_id: string | ProductsTypes
  sort: number | null
}
