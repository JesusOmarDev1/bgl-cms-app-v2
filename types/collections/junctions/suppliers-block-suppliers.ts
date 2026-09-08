import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
import type { SuppliersTypes } from "@/types/collections/suppliers"

export interface SuppliersBlockSuppliersJunction {
  id: number
  suppliers_block_id: string | SuppliersBlock
  item: string | SuppliersTypes
  collection: "suppliers"
}
