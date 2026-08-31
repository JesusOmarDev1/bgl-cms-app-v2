export type SocialLinkType =
  | "facebook"
  | "instagram"
  | "x_twitter"
  | "whatsapp"
  | "youtube"
  | "pinterest"
  | "tiktok"

export interface SocialLinksTypes {
  // General
  id: string
  sort: number | null
  title: string
  type: SocialLinkType
  url: string
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
