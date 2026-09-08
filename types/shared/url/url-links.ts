import { UrlLinkType } from "@/types/enums/url-link-type"
import { SubUrlLinksTypes } from "./sub-links"

export type UrlLinks = {
  // General
  id: string
  title: string
  url: string
  type: UrlLinkType
  icon: string
  sub_links: SubUrlLinksTypes[]
  // Audit
  date_created?: string | null
  date_updated?: string | null
}
