import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"

export interface ContentBlockContentJunction {
  id: number
  content_block_id: string | ContentBlock
  collection: "content_column_block"
  item: string | ContentColumnBlock
}
