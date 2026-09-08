import type { ContactBlockEmailsJunction } from "@/types/collections/junctions/contact-block-emails"
import type { ContactBlockPhonesJunction } from "@/types/collections/junctions/contact-block-phones"

export interface ContactBlock {
  // General
  id: string
  sort: number | null
  title: string
  excerpt: string
  emails: number[] | ContactBlockEmailsJunction[]
  phones: number[] | ContactBlockPhonesJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
