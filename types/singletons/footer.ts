import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { FooterEmailsJunction } from "@/types/collections/junctions/footer-emails"
import type { FooterPhonesJunction } from "@/types/collections/junctions/footer-phones"
import type { FooterSocialLinksJunction } from "@/types/collections/junctions/footer-social-links"
import type { FooterUrlLinksJunction } from "@/types/collections/junctions/footer-url-links"

export interface FooterType {
  // General
  id: string
  logo_dark: string | DirectusFileTypes | null
  social_links: number[] | FooterSocialLinksJunction[]
  phones: number[] | FooterPhonesJunction[]
  url_links: number[] | FooterUrlLinksJunction[]
  emails: number[] | FooterEmailsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
