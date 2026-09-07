import type { Query } from "@directus/sdk"
import type { BrandsTypes } from "@/types/collections/brands"
import type { Schema } from "@/types/schema"

export const BRANDS_FIELDS = [
  "id",
  "title",
  "excerpt",
  "slug",
  "date_created",
  "date_updated",
  { logo: ["*"] },
  {
    models: [
      "id",
      "brands_id",
      {
        models_id: [
          "id",
          "title",
          "slug",
          "date_created",
          "date_updated",
          { image: ["*"] },
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, BrandsTypes>["fields"]>
