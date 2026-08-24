export interface PhoneTypes {
  // General
  id: string
  sort?: number | null
  name: string
  phone: string
  position: string
  // Audit
  date_created?: string | null
  date_updated?: string | null
}
