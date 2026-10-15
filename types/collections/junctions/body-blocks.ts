import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { ClientsBlock } from "@/types/blocks/content/clients-block"
import type { ContactBlock } from "@/types/blocks/content/contact-block"
import type { CtaBlock } from "@/types/blocks/content/cta-block"
import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { LogosClientsBlock } from "@/types/blocks/content/logos-clients-block"
import type { MapBlock } from "@/types/blocks/content/map-block"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { QrCodeBlock } from "@/types/blocks/content/qr-code-block"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { FeaturedServicesBlock } from "@/types/blocks/content/services/featured-services-block"
import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
import type { FaqBlock } from "@/types/blocks/faq/faq-block"
import type { FormBlock } from "@/types/blocks/form/form-block"
import type {
  BlogPostsBodyCollection,
  BlogPostsBodyJunction,
} from "@/types/collections/junctions/blog-posts-body"
import type {
  ManualsBodyCollection,
  ManualsBodyJunction,
} from "@/types/collections/junctions/manuals-body"
import type {
  PageBodyBlockCollection,
  PagesBodyJunction,
} from "@/types/collections/junctions/pages-body"
import type {
  ServicesBodyCollection,
  ServicesBodyJunction,
} from "@/types/collections/junctions/services-body"

export type BodyBlockByCollection = {
  faq_block: FaqBlock
  map_block: MapBlock
  content_block: ContentBlock
  cta_block: CtaBlock
  form_block: FormBlock
  hero_block: HeroBlock
  qr_code_block: QrCodeBlock
  media_block: MediaBlock
  carousel_block: CarouselBlock
  clients_block: ClientsBlock
  suppliers_block: SuppliersBlock
  brands_block: BrandsBlock
  featured_services_block: FeaturedServicesBlock
  featured_products_block: FeaturedProductsBlock
  logos_clients_block: LogosClientsBlock
  division_services_block: DivisionServicesBlock
  contact_block: ContactBlock
}

export type GlobalBodyBlockCollection = keyof BodyBlockByCollection

export type BodyBlockData<K extends GlobalBodyBlockCollection> =
  BodyBlockByCollection[K]

export type BodyBlockItem<K extends GlobalBodyBlockCollection> = {
  [P in K]: {
    collection: P
    item: string | BodyBlockByCollection[P]
  }
}[K]

export type PagesBodyBlock = Pick<
  PagesBodyJunction,
  "id" | "sort" | "pages_id"
> &
  BodyBlockItem<PageBodyBlockCollection>

export type ServicesBodyBlock = Pick<
  ServicesBodyJunction,
  "id" | "sort" | "services_id"
> &
  BodyBlockItem<ServicesBodyCollection>

export type ManualsBodyBlock = Pick<
  ManualsBodyJunction,
  "id" | "sort" | "manuals_id"
> &
  BodyBlockItem<ManualsBodyCollection>

export type BlogPostsBodyBlock = Pick<
  BlogPostsBodyJunction,
  "id" | "sort" | "blog_posts_id"
> &
  BodyBlockItem<BlogPostsBodyCollection>
