import "server-only"

import type { Query } from "@directus/sdk"
import { BRANDS_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/brands-block/brands-block.fields"
import { CAROUSEL_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/carousel-block/carousel-block.fields"
import { CLIENTS_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/clients-block/clients-block.fields"
import { CONTENT_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/content-block/content-block.fields"
import { CTA_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/cta-block/cta-block.fields"
import { DIVISION_SERVICES_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/division-services-block/division-services-block.fields"
import { FAQ_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/faq-block/faq-block.fields"
import { FEATURED_PRODUCTS_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/featured-products-block/featured-products-block.fields"
import { FEATURED_SERVICES_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/featured-services-block/featured-services-block.fields"
import { FORM_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/form-block/form-block.fields"
import { HERO_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import { LOGOS_CLIENTS_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/logos-clients-block/logos-clients-block.fields"
import { MAP_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/map-block/map-block.fields"
import { MEDIA_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/media-block/media-block.fields"
import { QR_CODE_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/qr-code-block/qr-code-block.fields"
import { SUPPLIERS_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/suppliers-block/suppliers-block.fields"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { PagesTypes } from "@/types/collections/pages"
import type { Schema } from "@/types/schema"

export const PAGES_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "excerpt",
  "date_created",
  "date_updated",
  { image: ["*"] },
  { seo: SEO_FIELDS },
  {
    body: [
      "id",
      "collection",
      {
        item: {
          faq_block: FAQ_BLOCK_FIELDS,
          map_block: MAP_BLOCK_FIELDS,
          content_block: CONTENT_BLOCK_FIELDS,
          cta_block: CTA_BLOCK_FIELDS,
          form_block: FORM_BLOCK_FIELDS,
          hero_block: HERO_BLOCK_FIELDS,
          qr_code_block: QR_CODE_BLOCK_FIELDS,
          media_block: MEDIA_BLOCK_FIELDS,
          carousel_block: CAROUSEL_BLOCK_FIELDS,
          clients_block: CLIENTS_BLOCK_FIELDS,
          suppliers_block: SUPPLIERS_BLOCK_FIELDS,
          brands_block: BRANDS_BLOCK_FIELDS,
          featured_services_block: FEATURED_SERVICES_BLOCK_FIELDS,
          featured_products_block: FEATURED_PRODUCTS_BLOCK_FIELDS,
          logos_clients_block: LOGOS_CLIENTS_BLOCK_FIELDS,
          division_services_block: DIVISION_SERVICES_BLOCK_FIELDS,
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, PagesTypes>["fields"]>
