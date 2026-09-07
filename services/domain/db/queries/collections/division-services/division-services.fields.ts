import type { Query } from "@directus/sdk"
import type { DivisionServicesTypes } from "@/types/collections/division-services"
import type { Schema } from "@/types/schema"

export const DIVISION_SERVICES_FIELDS = [
  "id",
  "title",
  "slug",
  "date_created",
  "date_updated",
  { image: ["*"] },
] as const satisfies NonNullable<Query<Schema, DivisionServicesTypes>["fields"]>
