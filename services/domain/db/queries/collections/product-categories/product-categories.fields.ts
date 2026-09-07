import type { Query } from "@directus/sdk"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { Schema } from "@/types/schema"

export const PRODUCT_CATEGORIES_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "icon",
  "date_created",
  "date_updated",
  { image: ["*"] },
  {
    parent: ["id", "title", "slug", "status", "icon"],
  },
] as const satisfies NonNullable<
  Query<Schema, ProductCategoriesTypes>["fields"]
>
