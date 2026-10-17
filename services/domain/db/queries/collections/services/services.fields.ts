import "server-only"

import type { Query } from "@directus/sdk"
import { CAROUSEL_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/carousel-block/carousel-block.fields"
import { CONTENT_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/content-block/content-block.fields"
import { CTA_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/cta-block/cta-block.fields"
import { HERO_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import { MEDIA_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/media-block/media-block.fields"
import { QR_CODE_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/qr-code-block/qr-code-block.fields"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { ServicesTypes } from "@/types/collections/services"
import type { Schema } from "@/types/schema"

export const SERVICES_FIELDS = [
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
    service_category: [
      "id",
      "title",
      "slug",
      "icon",
      "parent",
      "status",
      "date_created",
      "date_updated",
      { image: ["*"] },
    ],
  },
  {
    body: [
      "id",
      "collection",
      {
        item: {
          content_block: CONTENT_BLOCK_FIELDS,
          cta_block: CTA_BLOCK_FIELDS,
          hero_block: HERO_BLOCK_FIELDS,
          qr_code_block: QR_CODE_BLOCK_FIELDS,
          media_block: MEDIA_BLOCK_FIELDS,
          carousel_block: CAROUSEL_BLOCK_FIELDS,
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ServicesTypes>["fields"]>

export const SERVICES_DEEP = {
  body: {
    _sort: ["sort"],
  },
} as const satisfies NonNullable<Query<Schema, ServicesTypes>["deep"]>
