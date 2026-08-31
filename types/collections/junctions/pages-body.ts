import type { BrandsBlock } from "@/types/blocks/brands-block"
import type { CarouselBlock } from "@/types/blocks/carousel-block"
import type { ClientsBlock } from "@/types/blocks/clients-block"
import type { ContentBlock } from "@/types/blocks/content-block"
import type { CtaBlock } from "@/types/blocks/cta-block"
import type { DivisionServicesBlock } from "@/types/blocks/division-services-block"
import type { FaqBlock } from "@/types/blocks/faq-block"
import type { FeaturedProductsBlock } from "@/types/blocks/featured-products-block"
import type { FeaturedServicesBlock } from "@/types/blocks/featured-services-block"
import type { FormBlock } from "@/types/blocks/form-block"
import type { HeroBlock } from "@/types/blocks/hero-block"
import type { LogosClientsBlock } from "@/types/blocks/logos-clients-block"
import type { MapBlock } from "@/types/blocks/map-block"
import type { MediaBlock } from "@/types/blocks/media-block"
import type { QrCodeBlock } from "@/types/blocks/qr-code-block"
import type { SuppliersBlock } from "@/types/blocks/suppliers-block"
import type { PagesTypes } from "@/types/collections/pages"

export type PageBodyBlockCollection =
  | "faq_block"
  | "map_block"
  | "content_block"
  | "cta_block"
  | "form_block"
  | "hero_block"
  | "qr_code_block"
  | "media_block"
  | "carousel_block"
  | "clients_block"
  | "suppliers_block"
  | "brands_block"
  | "featured_services_block"
  | "featured_products_block"
  | "logos_clients_block"
  | "division_services_block"

export interface PagesBodyJunction {
  id: number
  pages_id: string | PagesTypes
  collection: PageBodyBlockCollection
  item:
    | string
    | FaqBlock
    | MapBlock
    | ContentBlock
    | CtaBlock
    | FormBlock
    | HeroBlock
    | QrCodeBlock
    | MediaBlock
    | CarouselBlock
    | ClientsBlock
    | SuppliersBlock
    | BrandsBlock
    | FeaturedServicesBlock
    | FeaturedProductsBlock
    | LogosClientsBlock
    | DivisionServicesBlock
  sort: number | null
}
