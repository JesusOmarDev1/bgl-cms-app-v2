import type { Query } from "@directus/sdk"
import type { SocialLinksTypes } from "@/types/collections/social-links"
import type { Schema } from "@/types/schema"

export const SOCIAL_LINKS_FIELDS = [
  "id",
  "title",
  "type",
  "url",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, SocialLinksTypes>["fields"]>
