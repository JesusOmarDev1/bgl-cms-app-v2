import type { Query } from "@directus/sdk"
import type { ModelsTypes } from "@/types/collections/models"
import type { Schema } from "@/types/schema"

export const MODELS_FIELDS = [
  "id",
  "title",
  "slug",
  "date_created",
  "date_updated",
  { image: ["*"] },
  {
    images: ["id", "models_id", { directus_files_id: ["*"] }],
  },
] as const satisfies NonNullable<Query<Schema, ModelsTypes>["fields"]>
