import type { FeaturedProductsBlockProductsJunction } from "@/types/collections/junctions/featured-products-block-products"

export interface FeaturedProductsBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string | null
  products: number[] | FeaturedProductsBlockProductsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
