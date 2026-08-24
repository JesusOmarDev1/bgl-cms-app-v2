export const HttpRedirectEnum = ["301", "302", "307", "308"] as const
export type HttpRedirectType = (typeof HttpRedirectEnum)[number]
