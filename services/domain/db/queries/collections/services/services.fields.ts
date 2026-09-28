import "server-only"

import type { Query } from "@directus/sdk"
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
          content_block: [
            "id",
            "sort",
            "title",
            "layout",
            "padding",
            "padding_top",
            "padding_bottom",
            "date_created",
            "date_updated",
            {
              content: [
                "id",
                "collection",
                { item: { content_column_block: ["*"] } },
              ],
            },
          ],
          cta_block: ["*"],
          hero_block: [
            "id",
            "title",
            "variant",
            "sort",
            "primary_button",
            "primary_url",
            "primary_icon",
            "secondary_button",
            "secondary_url",
            "secondary_icon",
            "excerpt",
            "date_created",
            "date_updated",
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
            "id",
            "title",
            "type",
            "sort",
            "excerpt",
            "date_created",
            "date_updated",
            {
              file: ["*"],
              image: ["*"],
              video: ["*"],
              audio: ["*"],
              files: ["id", { directus_files_id: ["*"] }],
            },
          ],
          carousel_block: [
            "id",
            "variant",
            "title",
            "excerpt",
            "sort",
            "date_created",
            "date_updated",
            {
              items: [
                "id",
                "collection",
                {
                  item: {
                    carousel_items_block: [
                      "id",
                      "sort",
                      "title",
                      "date_created",
                      "date_updated",
                      { image: ["*"] },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ServicesTypes>["fields"]>
