export const UrlLinkTypeEnum = ["link", "dropdown"] as const
export type UrlLinkType = (typeof UrlLinkTypeEnum)[number]
