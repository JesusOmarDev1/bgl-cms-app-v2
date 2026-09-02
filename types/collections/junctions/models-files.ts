import type { ModelsTypes } from "@/types/collections/models"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface ModelsFilesJunction {
  id: number
  models_id: string | ModelsTypes
  directus_files_id: string | DirectusFileTypes
}
