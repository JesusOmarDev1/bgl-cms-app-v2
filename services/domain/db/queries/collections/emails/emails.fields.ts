import type { Query } from "@directus/sdk"
import type { EmailTypes } from "@/types/collections/emails"
import type { Schema } from "@/types/schema"

export const EMAILS_FIELDS = [
  "id",
  "name",
  "email",
  "position",
] as const satisfies NonNullable<Query<Schema, EmailTypes>["fields"]>
