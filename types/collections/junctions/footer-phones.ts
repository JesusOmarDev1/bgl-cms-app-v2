import type { FooterType } from "@/types/singletons/footer"
import type { PhoneTypes } from "@/types/collections/phones"

export interface FooterPhonesJunction {
  id: number
  footer_id: string | FooterType
  item: string | PhoneTypes
  collection: "phones"
}
