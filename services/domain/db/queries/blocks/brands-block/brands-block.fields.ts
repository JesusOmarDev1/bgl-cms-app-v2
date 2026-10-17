import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { BrandsBlock } from "@/types/blocks/content/brands-block"
import type { Schema } from "@/types/schema"

export const BRANDS_BLOCK_FIELDS = [
  "id",
  "title",
  "excerpt",
  "sort",
  "date_created",
  "date_updated",
  {
    brands: [
      "id",
      {
        brands_id: [
          "id",
          "title",
          "excerpt",
          { logo: ["*"] },
          "slug",
          "status",
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, BrandsBlock>["fields"]>

export type BrandsBlockQuery = ApplyQueryFields<
  Schema,
  BrandsBlock,
  typeof BRANDS_BLOCK_FIELDS
>
