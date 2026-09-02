import type { SocialLinkType } from "@/types/enums/social-link-type"

export interface SocialLinksTypes {
  // General
  id: string
  title: string
  type: SocialLinkType
  url: string
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
