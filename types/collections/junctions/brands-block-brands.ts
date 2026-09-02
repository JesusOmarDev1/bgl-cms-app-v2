import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { BrandsTypes } from "@/types/collections/brands"

export interface BrandsBlockBrandsJunction {
  id: number
  brands_block_id: string | BrandsBlock
  brands_id: string | BrandsTypes
}
