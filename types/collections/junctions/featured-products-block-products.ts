import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { ProductsTypes } from "@/types/collections/products"

export interface FeaturedProductsBlockProductsJunction {
  id: number
  featured_products_block_id: string | FeaturedProductsBlock
  products_id: string | ProductsTypes
}
