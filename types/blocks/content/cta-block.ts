export type CtaBlockVariant = "normal"

export interface CtaBlock {
  // General
  id: string
  title: string
  excerpt: string | null
  variant: CtaBlockVariant
  primary_button: string
  secondary_button: string | null
  secondary_url: string | null
  primary_url: string
  primary_icon: string
  secondary_icon: string | null
  sort: number | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
