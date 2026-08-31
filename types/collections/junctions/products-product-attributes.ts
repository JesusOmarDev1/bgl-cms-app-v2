import type { ProductsTypes } from "@/types/collections/products"
import type { ProductAttributesTypes } from "@/types/collections/product-attributes"

export interface ProductsProductAttributesJunction {
  id: number
  products_id: string | ProductsTypes
  product_attributes_id: string | ProductAttributesTypes
  sort: number | null
}
