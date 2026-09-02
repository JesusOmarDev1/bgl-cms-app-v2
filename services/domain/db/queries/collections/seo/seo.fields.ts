import type { Query } from "@directus/sdk"
import type { SeoTypes } from "@/types/collections/seo"
import type { Schema } from "@/types/schema"

export const SEO_FIELDS = [
  "id",
  "title",
  "description",
  "no_index",
  "no_follow",
  "frecuency",
  { og_image: ["*"] },
  "canonical",
  "keywords",
  "priority",
  "exclude",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, SeoTypes>["fields"]>
