import type { CarouselBlockVariant } from "@/types/enums/carousel-block-variant"

export interface CarouselBlock {
  // General
  id: string
  variant: CarouselBlockVariant
  title: string
  excerpt: string | null
  sort: number | null
  items: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
