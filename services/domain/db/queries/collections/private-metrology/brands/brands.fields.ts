import type { Query } from "@directus/sdk"
import type { BrandsTypes } from "@/types/collections/brands"
import type { Schema } from "@/types/schema"

export const PRIVATE_BRANDS_FIELDS = ["id", "title"] as const satisfies NonNullable<
  Query<Schema, BrandsTypes>["fields"]
>
