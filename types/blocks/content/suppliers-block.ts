import type { SuppliersBlockSuppliersJunction } from "@/types/collections/junctions/suppliers-block-suppliers"

export interface SuppliersBlock {
  // General
  id: string
  title: string | null
  excerpt: string | null
  sort: number | null
  suppliers: number[] | SuppliersBlockSuppliersJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
