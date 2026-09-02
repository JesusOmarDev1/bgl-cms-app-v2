import type { FooterType } from "@/types/singletons/footer"
import type { EmailTypes } from "@/types/collections/emails"

export interface FooterEmailsJunction {
  id: number
  footer_id: string | FooterType
  item: string | EmailTypes
  collection: "emails"
}
