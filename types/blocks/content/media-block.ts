import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { MediaBlockType } from "@/types/enums/media-block-type"

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
  files: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
