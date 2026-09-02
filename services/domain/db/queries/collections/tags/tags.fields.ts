import type { Query } from "@directus/sdk"
import type { TagTypes } from "@/types/collections/tags"
import type { Schema } from "@/types/schema"

export const TAGS_FIELDS = [
  "id",
  "title",
  "slug",
  "color",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, TagTypes>["fields"]>
