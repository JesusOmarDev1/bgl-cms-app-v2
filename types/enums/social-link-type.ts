export const SocialLinkTypeEnum = [
  "facebook",
  "instagram",
  "x_twitter",
  "whatsapp",
  "youtube",
  "pinterest",
  "tiktok",
] as const
export type SocialLinkType = (typeof SocialLinkTypeEnum)[number]
