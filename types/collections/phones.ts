import type { ContactPosition } from "@/types/enums/contact-position"

export interface PhoneTypes {
  // General
  id: string
  name: string
  phone: string
  position: ContactPosition
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
