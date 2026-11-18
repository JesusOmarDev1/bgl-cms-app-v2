import type { Query } from "@directus/sdk"
import type { ClientsTypes } from "@/types/collections/clients"
import type { Schema } from "@/types/schema"

export const PRIVATE_CLIENTS_FIELDS = ["id", "name"] as const satisfies NonNullable<
  Query<Schema, ClientsTypes>["fields"]
>
