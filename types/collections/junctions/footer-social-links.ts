import type { FooterType } from "@/types/singletons/footer"
import type { SocialLinksTypes } from "@/types/collections/social-links"

export interface FooterSocialLinksJunction {
  id: number
  footer_id: string | FooterType
  item: string | SocialLinksTypes
  collection: "social_links"
  sort: number | null
}
