import type { ContactBlock } from "@/types/blocks/content/contact-block"
import type { EmailTypes } from "@/types/collections/emails"

export interface ContactBlockEmailsJunction {
  id: number
  contact_block_id: string | ContactBlock
  emails_id: string | EmailTypes
}
