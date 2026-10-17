import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { FeaturedProductsBlock } from "@/types/blocks/content/featured-products-block"
import type { Schema } from "@/types/schema"

export const FEATURED_PRODUCTS_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "excerpt",
  "date_created",
  "date_updated",
  {
    products: [
      "id",
      {
        products_id: [
          "id",
          "slug",
          "title",
          "status",
          "excerpt",
          { image: ["*"] },
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, FeaturedProductsBlock>["fields"]>

export type FeaturedProductsBlockQuery = ApplyQueryFields<
  Schema,
  FeaturedProductsBlock,
  typeof FEATURED_PRODUCTS_BLOCK_FIELDS
>
