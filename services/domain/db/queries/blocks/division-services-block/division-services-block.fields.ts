import type { ApplyQueryFields, Query } from "@directus/sdk"
import type { DivisionServicesBlock } from "@/types/blocks/content/services/division-services-block"
import type { Schema } from "@/types/schema"

export const DIVISION_SERVICES_BLOCK_FIELDS = [
  "id",
  "sort",
  "title",
  "excerpt",
  "date_created",
  "date_updated",
  {
    division_services: [
      "id",
      {
        division_services_id: [
          "id",
          "title",
          "slug",
          { image: ["*"] },
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, DivisionServicesBlock>["fields"]>

export type DivisionServicesBlockQuery = ApplyQueryFields<
  Schema,
  DivisionServicesBlock,
  typeof DIVISION_SERVICES_BLOCK_FIELDS
>
