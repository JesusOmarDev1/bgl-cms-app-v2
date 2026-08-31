import type { CarouselBlock } from "@/types/blocks/carousel-block"
import type { ContentBlock } from "@/types/blocks/content-block"
import type { FaqBlock } from "@/types/blocks/faq-block"
import type { HeroBlock } from "@/types/blocks/hero-block"
import type { MapBlock } from "@/types/blocks/map-block"
import type { MediaBlock } from "@/types/blocks/media-block"
import type { QrCodeBlock } from "@/types/blocks/qr-code-block"
import type { ManualsTypes } from "@/types/collections/manuals"

export type ManualsBodyCollection =
  | "map_block"
  | "content_block"
  | "faq_block"
  | "hero_block"
  | "qr_code_block"
  | "media_block"
  | "carousel_block"

export interface ManualsBodyJunction {
  id: number
  manuals_id: string | ManualsTypes
  collection: ManualsBodyCollection
  item:
    | string
    | MapBlock
    | ContentBlock
    | FaqBlock
    | HeroBlock
    | QrCodeBlock
    | MediaBlock
    | CarouselBlock
  sort: number | null
}
