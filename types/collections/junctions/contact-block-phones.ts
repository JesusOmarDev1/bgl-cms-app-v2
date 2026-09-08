import type { ContactBlock } from "@/types/blocks/content/contact-block"
import type { PhoneTypes } from "@/types/collections/phones"

export interface ContactBlockPhonesJunction {
  id: number
  contact_block_id: string | ContactBlock
  phones_id: string | PhoneTypes
}
