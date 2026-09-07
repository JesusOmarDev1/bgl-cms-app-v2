import type { Query } from "@directus/sdk"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { Schema } from "@/types/schema"

export const SUPPLIERS_FIELDS = [
  "id",
  "name",
  "website",
  "slug",
  "active",
  "status",
  "date_created",
  "date_updated",
  { logo: ["*"] },
] as const satisfies NonNullable<Query<Schema, SuppliersTypes>["fields"]>
