import type { HeaderType } from "@/types/singletons/header"
import type { SocialLinksTypes } from "@/types/collections/social-links"

export interface HeaderSocialLinksJunction {
  id: number
  header_id: string | HeaderType
  item: string | SocialLinksTypes
  collection: "social_links"
}
