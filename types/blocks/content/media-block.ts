import type { MediaBlockFilesJunction } from "@/types/collections/junctions/media-block-files"
import type { MediaBlockType } from "@/types/enums/media-block-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface MediaBlock {
  // General
  id: string
  title: string
  file: string | DirectusFileTypes | null
  type: MediaBlockType
  image: string | DirectusFileTypes | null
  sort: number | null
  video: string | DirectusFileTypes | null
  excerpt: string | null
  audio: string | DirectusFileTypes | null
  files: number[] | MediaBlockFilesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
