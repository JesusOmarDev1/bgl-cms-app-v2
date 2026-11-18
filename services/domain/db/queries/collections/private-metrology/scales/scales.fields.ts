import type { Query } from "@directus/sdk"
import type { ScalesTypes } from "@/types/collections/scales"
import type { Schema } from "@/types/schema"

export const PRIVATE_SCALES_FIELDS = [
  "id",
  "title",
  "serial_number",
  "identification",
  "status",
  { client: ["id", "name"] },
] as const satisfies NonNullable<Query<Schema, ScalesTypes>["fields"]>
