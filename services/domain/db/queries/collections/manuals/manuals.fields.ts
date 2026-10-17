import "server-only"

import type { Query } from "@directus/sdk"
import { CAROUSEL_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/carousel-block/carousel-block.fields"
import { CONTENT_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/content-block/content-block.fields"
import { FAQ_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/faq-block/faq-block.fields"
import { HERO_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import { MAP_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/map-block/map-block.fields"
import { MEDIA_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/media-block/media-block.fields"
import { QR_CODE_BLOCK_FIELDS } from "@/services/domain/db/queries/blocks/qr-code-block/qr-code-block.fields"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { ManualsTypes } from "@/types/collections/manuals"
import type { Schema } from "@/types/schema"

export const MANUALS_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "excerpt",
  "yt_video",
  "date_created",
  "date_updated",
  { image: ["*"] },
  { seo: SEO_FIELDS },
  {
    manual_category: [
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
          map_block: MAP_BLOCK_FIELDS,
          content_block: CONTENT_BLOCK_FIELDS,
          faq_block: FAQ_BLOCK_FIELDS,
          hero_block: HERO_BLOCK_FIELDS,
          qr_code_block: QR_CODE_BLOCK_FIELDS,
          media_block: MEDIA_BLOCK_FIELDS,
          carousel_block: CAROUSEL_BLOCK_FIELDS,
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ManualsTypes>["fields"]>

export const MANUALS_DEEP = {
  body: {
    _sort: ["sort"],
  },
} as const satisfies NonNullable<Query<Schema, ManualsTypes>["deep"]>
