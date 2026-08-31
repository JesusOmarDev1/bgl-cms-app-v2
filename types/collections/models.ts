import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { ModelsFilesJunction } from "@/types/collections/junctions/models-files"

export interface ModelsTypes {
  // General
  id: string
  title: string
  slug: string | null
  image: string | DirectusFileTypes | null
  sort: number | null
  status: StatusType
  images: number[] | ModelsFilesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
