import type { ContactPositionType } from "@/types/enums/contact-position"

export interface EmailTypes {
  // General
  id: string
  name: string
  email: string
  position: ContactPositionType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
