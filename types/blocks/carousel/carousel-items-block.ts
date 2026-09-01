import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface CarouselItemsBlock {
  // General
  id: string
  sort: number | null
  image: string | DirectusFileTypes
  title: string
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
