import type { Query } from "@directus/sdk"
import type { RedirectsTypes } from "@/types/collections/redirects"
import type { Schema } from "@/types/schema"

export const REDIRECTS_FIELDS = [
  "id",
  "title",
  "origin",
  "destiny",
  "http_code",
  "note",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, RedirectsTypes>["fields"]>
