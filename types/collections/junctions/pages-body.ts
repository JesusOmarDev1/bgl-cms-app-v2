import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { ClientsBlock } from "@/types/blocks/content/clients-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { CtaBlock } from "@/types/blocks/content/cta-block"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { FeaturedServicesBlock } from "@/types/blocks/content/services/featured-services-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { MapBlock } from "@/types/blocks/content/map-block"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
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
