import type { Query } from "@directus/sdk"
import type { SubLinksTypes } from "@/types/collections/sub-links"
import type { Schema } from "@/types/schema"

export const SUB_LINKS_FIELDS = [
  "id",
  "title",
  "url",
  "icon",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, SubLinksTypes>["fields"]>
