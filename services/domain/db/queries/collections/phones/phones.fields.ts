import type { Query } from "@directus/sdk"
import type { PhoneTypes } from "@/types/collections/phones"
import type { Schema } from "@/types/schema"

export const PHONES_FIELDS = [
  "id",
  "name",
  "phone",
  "position",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, PhoneTypes>["fields"]>
