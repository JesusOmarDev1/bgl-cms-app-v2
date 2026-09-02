export const ContentBlockLayoutEnum = ["one", "two", "three"] as const
export type ContentBlockLayout = (typeof ContentBlockLayoutEnum)[number]
