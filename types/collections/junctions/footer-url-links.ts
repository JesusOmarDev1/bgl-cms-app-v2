import type { FooterType } from "@/types/singletons/footer"
import type { UrlLinksTypes } from "@/types/collections/url-links"

export interface FooterUrlLinksJunction {
  id: number
  footer_id: string | FooterType
  item: string | UrlLinksTypes
  collection: "url_links"
  sort: number | null
}
