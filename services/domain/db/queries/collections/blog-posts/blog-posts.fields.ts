import "server-only"

import type { Query } from "@directus/sdk"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { BlogPostsTypes } from "@/types/collections/blog-posts"
import type { Schema } from "@/types/schema"

export const BLOG_POSTS_FIELDS = [
  "id",
  "title",
  "slug",
  "published_at",
  "status",
  "excerpt",
  "date_created",
  "date_updated",
  { image: ["*"] },
  { seo: SEO_FIELDS },
  {
    blog_category: [
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
    tags: [
      "id",
      {
        tags_id: [
          "id",
          "title",
          "slug",
          "color",
          "date_created",
          "date_updated",
        ],
      },
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
          cta_block: ["*"],
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
] as const satisfies NonNullable<Query<Schema, BlogPostsTypes>["fields"]>
