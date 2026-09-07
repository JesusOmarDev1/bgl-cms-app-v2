import type { Query } from "@directus/sdk"
import type { ClientsTypes } from "@/types/collections/clients"
import type { Schema } from "@/types/schema"

export const CLIENTS_FIELDS = [
  "id",
  "name",
  "website",
  "slug",
  "active",
  "status",
  "date_created",
  "date_updated",
  { logo: ["*"] },
] as const satisfies NonNullable<Query<Schema, ClientsTypes>["fields"]>
