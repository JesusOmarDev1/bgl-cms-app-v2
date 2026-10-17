import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { Schema } from "@/types/schema"

export const HERO_BLOCK_FIELDS = [
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
] as const satisfies NonNullable<Query<Schema, HeroBlock>["fields"]>

export type HeroBlockQuery = ApplyQueryFields<
  Schema,
  HeroBlock,
  typeof HERO_BLOCK_FIELDS
>
