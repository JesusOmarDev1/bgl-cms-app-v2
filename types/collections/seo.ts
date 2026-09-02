import type { SeoFrequency } from "@/types/enums/seo-frequency"
import type { DirectusFileTypes } from "@/types/shared/directus-file"

export interface SeoTypes {
  // General
  id: string
  title: string
  description: string
  no_index: boolean
  no_follow: boolean
  frecuency: SeoFrequency
  og_image: string | DirectusFileTypes | null
  canonical: string | null
  keywords: "json"
  priority: number
  exclude: boolean | null
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
