import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface MediaBlockFilesJunction {
  id: number
  media_block_id: string | MediaBlock
  directus_files_id: string | DirectusFileTypes
}
