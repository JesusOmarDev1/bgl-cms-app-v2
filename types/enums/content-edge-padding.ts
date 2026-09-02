export const ContentEdgePaddingEnum = [
  "default",
  "none",
  "lg",
  "md",
  "sm",
] as const
export type ContentEdgePadding = (typeof ContentEdgePaddingEnum)[number]
