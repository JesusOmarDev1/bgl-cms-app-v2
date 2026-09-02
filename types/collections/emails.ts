import type { ContactPosition } from "@/types/enums/contact-position"

export interface EmailTypes {
  // General
  id: string
  name: string
  email: string
  position: ContactPosition
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
