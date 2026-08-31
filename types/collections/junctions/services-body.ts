import type { CarouselBlock } from "@/types/blocks/carousel-block"
import type { ContentBlock } from "@/types/blocks/content-block"
import type { CtaBlock } from "@/types/blocks/cta-block"
import type { HeroBlock } from "@/types/blocks/hero-block"
import type { MediaBlock } from "@/types/blocks/media-block"
import type { QrCodeBlock } from "@/types/blocks/qr-code-block"
import type { ServicesTypes } from "@/types/collections/services"

export type ServicesBodyCollection =
  | "content_block"
  | "cta_block"
  | "hero_block"
  | "qr_code_block"
  | "media_block"
  | "carousel_block"

export interface ServicesBodyJunction {
  id: number
  services_id: string | ServicesTypes
  collection: ServicesBodyCollection
  item:
    | string
    | ContentBlock
    | CtaBlock
    | HeroBlock
    | QrCodeBlock
    | MediaBlock
    | CarouselBlock
  sort: number | null
}
