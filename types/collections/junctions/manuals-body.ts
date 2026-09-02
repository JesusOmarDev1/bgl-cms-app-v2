import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { MapBlock } from "@/types/blocks/content/map-block"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
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
}
