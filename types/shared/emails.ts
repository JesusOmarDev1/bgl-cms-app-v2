export interface EmailTypes {
  // General
  id: string
  sort?: number | null
  name: string
  email: string
  position: string
  // Audit
  date_created?: string | null
  date_updated?: string | null
}
