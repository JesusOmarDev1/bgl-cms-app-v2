import type { ComponentType } from "react"
import { CarouselBlockClient } from "@/components/blocks/content/carousel/CarouselBlockClient"
import { CarouselSkeleton } from "@/components/blocks/content/carousel/CarouselSkeleton"
import { BrandsSkeleton } from "@/components/blocks/content/carousel/BrandsSkeleton"
import { CarouselBrandsClient } from "@/components/blocks/content/carousel/CarouselBrandsClient"
import { CarouselClientsClient } from "@/components/blocks/content/client/CarouselClientsClient"
import { ClientsSkeleton } from "@/components/blocks/content/client/ClientsSkeleton"
import { ContactClient } from "@/components/blocks/content/contact/ContactClient"
import { ContactSkeleton } from "@/components/blocks/content/contact/ContactSkeleton"
import { CtaClient } from "@/components/blocks/content/cta/CtaClient"
import { CtaSkeleton } from "@/components/blocks/content/cta/CtaSkeleton"
import { FaqClient } from "@/components/blocks/content/faq/FaqClient"
import { FaqSkeleton } from "@/components/blocks/content/faq/FaqSkeleton"
import { FormClient } from "@/components/blocks/content/form/FormClient"
import { FormSkeleton } from "@/components/blocks/content/form/FormSkeleton"
import { HeroClient } from "@/components/blocks/content/hero/HeroClient"
import { HeroSkeleton } from "@/components/blocks/content/hero/HeroSkeleton"
import { ContentBlockClient } from "@/components/blocks/content/html/ContentBlockClient"
import { ContentSkeleton } from "@/components/blocks/content/html/ContentSkeleton"
import { LogosClientsClient } from "@/components/blocks/content/logos/LogosClientsClient"
import { LogosClientsSkeleton } from "@/components/blocks/content/logos/LogosClientsSkeleton"
import MapViewerClient from "@/components/blocks/content/map/MapViewerClient"
import { MapSkeleton } from "@/components/blocks/content/map/MapSkeleton"
import MediaClient from "@/components/blocks/content/media/MediaClient"
import { MediaSkeleton } from "@/components/blocks/content/media/MediaSkeleton"
import { FeaturedProductsClient } from "@/components/blocks/content/products/FeaturedProductsClient"
import { FeaturedProductsSkeleton } from "@/components/blocks/content/products/FeaturedProductsSkeleton"
import QrCodeClient from "@/components/blocks/content/qr/QrCodeClient"
import { QrCodeSkeleton } from "@/components/blocks/content/qr/QrCodeSkeleton"
import { DivisionServicesClient } from "@/components/blocks/content/services/DivisionServicesClient"
import { DivisionServicesSkeleton } from "@/components/blocks/content/services/DivisionServicesSkeleton"
import { FeaturedServicesClient } from "@/components/blocks/content/services/FeaturedServicesClient"
import { FeaturedServicesSkeleton } from "@/components/blocks/content/services/FeaturedServicesSkeleton"
import { SuppliersClient } from "@/components/blocks/content/suppliers/SuppliersClient"
import { SuppliersSkeleton } from "@/components/blocks/content/suppliers/SuppliersSkeleton"
import type {
  BodyBlockData,
  GlobalBodyBlockCollection,
} from "@/types/collections/junctions/body-blocks"

export type BlockRegistryEntry<K extends GlobalBodyBlockCollection> = {
  Component: ComponentType<{ data: BodyBlockData<K> }>
  Skeleton: ComponentType
}

export type BlockRegistry = {
  [K in GlobalBodyBlockCollection]: BlockRegistryEntry<K>
}

export const blockRegistry = {
  faq_block: { Component: FaqClient, Skeleton: FaqSkeleton },
  map_block: { Component: MapViewerClient, Skeleton: MapSkeleton },
  content_block: { Component: ContentBlockClient, Skeleton: ContentSkeleton },
  cta_block: { Component: CtaClient, Skeleton: CtaSkeleton },
  form_block: { Component: FormClient, Skeleton: FormSkeleton },
  hero_block: { Component: HeroClient, Skeleton: HeroSkeleton },
  qr_code_block: { Component: QrCodeClient, Skeleton: QrCodeSkeleton },
  media_block: { Component: MediaClient, Skeleton: MediaSkeleton },
  carousel_block: {
    Component: CarouselBlockClient,
    Skeleton: CarouselSkeleton,
  },
  clients_block: {
    Component: CarouselClientsClient,
    Skeleton: ClientsSkeleton,
  },
  suppliers_block: { Component: SuppliersClient, Skeleton: SuppliersSkeleton },
  brands_block: { Component: CarouselBrandsClient, Skeleton: BrandsSkeleton },
  featured_services_block: {
    Component: FeaturedServicesClient,
    Skeleton: FeaturedServicesSkeleton,
  },
  featured_products_block: {
    Component: FeaturedProductsClient,
    Skeleton: FeaturedProductsSkeleton,
  },
  logos_clients_block: {
    Component: LogosClientsClient,
    Skeleton: LogosClientsSkeleton,
  },
  division_services_block: {
    Component: DivisionServicesClient,
    Skeleton: DivisionServicesSkeleton,
  },
  contact_block: { Component: ContactClient, Skeleton: ContactSkeleton },
} satisfies BlockRegistry
