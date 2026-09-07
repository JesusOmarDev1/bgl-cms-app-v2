import "server-only"

import type { Query } from "@directus/sdk"
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
          map_block: ["*"],
          content_block: [
            "*",
            {
              content: [
                "id",
                "collection",
                { item: { content_column_block: ["*"] } },
              ],
            },
          ],
          faq_block: [
            "*",
            {
              questions: [
                "id",
                "collection",
                { item: { faq_questions: ["*"] } },
              ],
            },
          ],
          hero_block: [
            "*",
            {
              image: ["*"],
              images: ["id", { directus_files_id: ["*"] }],
              brands: [
                "id",
                {
                  brands_id: [
                    "id",
                    "title",
                    "excerpt",
                    { logo: ["*"] },
                    "slug",
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          qr_code_block: ["*"],
          media_block: [
            "*",
            {
              file: ["*"],
              image: ["*"],
              video: ["*"],
              audio: ["*"],
              files: ["id", { directus_files_id: ["*"] }],
            },
          ],
          carousel_block: [
            "*",
            {
              items: [
                "id",
                "collection",
                {
                  item: {
                    carousel_items_block: ["*", { image: ["*"] }],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ManualsTypes>["fields"]>
