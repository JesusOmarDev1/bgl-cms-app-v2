import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { FeaturedServicesBlock } from "@/types/blocks/content/services/featured-services-block"
import type { Schema } from "@/types/schema"

export const FEATURED_SERVICES_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "excerpt",
  "date_created",
  "date_updated",
  {
    services: [
      "id",
      {
        services_id: [
          "id",
          "title",
          "slug",
          "status",
          "excerpt",
          { image: ["*"] },
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, FeaturedServicesBlock>["fields"]>

export type FeaturedServicesBlockQuery = ApplyQueryFields<
  Schema,
  FeaturedServicesBlock,
  typeof FEATURED_SERVICES_BLOCK_FIELDS
>
