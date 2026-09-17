import type { ContactPositionType } from "@/types/enums/contact-position"

export interface PhoneTypes {
  // General
  id: string
  name: string
  phone: string
  position: ContactPositionType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
