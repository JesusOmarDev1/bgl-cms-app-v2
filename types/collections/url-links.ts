import type { UrlLinksSubLinksJunction } from "@/types/collections/junctions/url-links-sub-links"

export type UrlLinkType = "link" | "dropdown"

export interface UrlLinksTypes {
  // General
  id: string
  title: string
  url: string
  sort: number | null
  type: UrlLinkType
  icon: string | null
  sub_links: number[] | UrlLinksSubLinksJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
