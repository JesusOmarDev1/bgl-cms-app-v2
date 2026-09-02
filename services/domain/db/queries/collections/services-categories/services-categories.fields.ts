import type { Query } from "@directus/sdk"
import type { ServicesCategoriesTypes } from "@/types/collections/services-categories"
import type { Schema } from "@/types/schema"

export const SERVICES_CATEGORIES_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "icon",
  { image: ["*"] },
  "parent",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<
  Query<Schema, ServicesCategoriesTypes>["fields"]
>
