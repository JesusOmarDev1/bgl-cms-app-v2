import type { HeaderType } from "@/types/singletons/header"
import type { UrlLinksTypes } from "@/types/collections/url-links"

export interface HeaderUrlLinksJunction {
  id: number
  header_id: string | HeaderType
  item: string | UrlLinksTypes
  collection: "url_links"
}
