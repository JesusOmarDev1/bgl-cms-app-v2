export interface SubLinksTypes {
  // General
  id: string
  sort: number | null
  title: string
  url: string
  icon: string | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
