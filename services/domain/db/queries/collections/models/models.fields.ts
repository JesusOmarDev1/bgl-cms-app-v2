export const MODELS_FIELDS = [
  "id",
  "title",
  "slug",
  "date_created",
  "date_updated",
  "image.*",
  "images.id",
  "images.models_id",
  "images.directus_files_id.*",
] as const
