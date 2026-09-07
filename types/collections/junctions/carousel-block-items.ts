import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { CarouselItemsBlock } from "@/types/blocks/carousel/carousel-items-block"

export type CarouselBlockItemsCollection = "carousel_items_block"

export interface CarouselBlockItemsJunction {
  id: number
  carousel_block_id: string | CarouselBlock
  collection: CarouselBlockItemsCollection
  item: string | CarouselItemsBlock
}
