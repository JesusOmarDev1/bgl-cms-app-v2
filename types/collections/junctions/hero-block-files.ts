import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface HeroBlockFilesJunction {
  id: number
  hero_block_id: string | HeroBlock
  directus_files_id: string | DirectusFileTypes
}
