import type { Query } from "@directus/sdk"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { Schema } from "@/types/schema"

export const PRIVATE_SUPPLIERS_FIELDS = ["id", "name"] as const satisfies NonNullable<
  Query<Schema, SuppliersTypes>["fields"]
>
