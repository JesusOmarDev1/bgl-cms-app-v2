export interface SessionIdentityTypes {
  // General
  first_name: string | null
  last_name: string | null
  email: string | null
  title: string | null
  location: string | null
  description: string | null
  tags: string[] | null
  // Audit
  last_access: string | null
}
