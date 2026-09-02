import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { BrandsTypes } from "@/types/collections/brands"

export interface HeroBlockBrandsJunction {
  id: number
  hero_block_id: string | HeroBlock
  brands_id: string | BrandsTypes
}
