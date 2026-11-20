import type { Query } from "@directus/sdk"
import type { ModelsTypes } from "@/types/collections/models"
import type { Schema } from "@/types/schema"

export const PRIVATE_MODELS_FIELDS = [
  "id",
  "title",
] as const satisfies NonNullable<Query<Schema, ModelsTypes>["fields"]>
