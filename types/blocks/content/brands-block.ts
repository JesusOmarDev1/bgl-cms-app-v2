import type { BrandsBlockBrandsJunction } from "@/types/collections/junctions/brands-block-brands"

export interface BrandsBlock {
  // General
  id: string
  title: string
  sort: number | null
  excerpt: string | null
  brands: number[] | BrandsBlockBrandsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
