export const StatusEnum = ["published", "archived", "draft"] as const
export type StatusType = (typeof StatusEnum)[number]
