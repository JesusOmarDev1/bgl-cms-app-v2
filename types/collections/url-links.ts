import type { UrlLinksSubLinksJunction } from "@/types/collections/junctions/url-links-sub-links"
import type { UrlLinkType } from "@/types/enums/url-link-type"

export interface UrlLinksTypes {
  // General
  id: string
  title: string
  url: string
  type: UrlLinkType
  icon: string | null
  sub_links: number[] | UrlLinksSubLinksJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
