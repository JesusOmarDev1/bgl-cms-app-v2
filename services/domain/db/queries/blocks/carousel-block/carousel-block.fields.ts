import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { Schema } from "@/types/schema"

export const CAROUSEL_BLOCK_FIELDS = [
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
] as const satisfies NonNullable<Query<Schema, CarouselBlock>["fields"]>

export type CarouselBlockQuery = ApplyQueryFields<
  Schema,
  CarouselBlock,
  typeof CAROUSEL_BLOCK_FIELDS
>
