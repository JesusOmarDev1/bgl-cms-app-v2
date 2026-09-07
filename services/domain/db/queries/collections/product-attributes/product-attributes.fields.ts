import type { Query } from "@directus/sdk"
import type { ProductAttributesTypes } from "@/types/collections/product-attributes"
import type { Schema } from "@/types/schema"

export const PRODUCT_ATTRIBUTES_FIELDS = [
  "id",
  "title",
  "slug",
  "units",
  "value",
  "group",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<
  Query<Schema, ProductAttributesTypes>["fields"]
>
