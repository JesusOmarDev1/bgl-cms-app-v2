import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { CtaBlock } from "@/types/blocks/content/cta-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
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
