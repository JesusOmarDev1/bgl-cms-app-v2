export interface EmailTypes {
  // General
  id: string
  name: string
  email: string
  position: string
  // Audit
  date_created?: string | null
  date_updated?: string | null
}
