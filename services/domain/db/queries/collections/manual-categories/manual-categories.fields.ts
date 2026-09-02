import type { Query } from "@directus/sdk"
import type { ManualCategoriesTypes } from "@/types/collections/manual-categories"
import type { Schema } from "@/types/schema"

export const MANUAL_CATEGORIES_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "icon",
  "parent",
  { image: ["*"] },
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, ManualCategoriesTypes>["fields"]>
