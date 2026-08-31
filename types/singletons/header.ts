import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { HeaderSocialLinksJunction } from "@/types/collections/junctions/header-social-links"
import type { HeaderUrlLinksJunction } from "@/types/collections/junctions/header-url-links"

export interface HeaderType {
  // General
  id: string
  primary_button: string
  primary_url: string
  primary_icon: string
  secondary_button: string | null
  secondary_url: string | null
  secondary_icon: string | null
  logo_dark: string | DirectusFileTypes | null
  social_links: number[] | HeaderSocialLinksJunction[]
  url_links: number[] | HeaderUrlLinksJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
