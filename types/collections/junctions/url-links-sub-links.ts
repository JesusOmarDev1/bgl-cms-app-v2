import type { UrlLinksTypes } from "@/types/collections/url-links"
import type { SubLinksTypes } from "@/types/collections/sub-links"

export interface UrlLinksSubLinksJunction {
  id: number
  url_links_id: string | UrlLinksTypes
  sub_links_id: string | SubLinksTypes
  sort: number | null
}
