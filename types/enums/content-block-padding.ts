export const ContentBlockPaddingEnum = [
  "default",
  "none",
  "compact",
  "full_width",
] as const
export type ContentBlockPadding = (typeof ContentBlockPaddingEnum)[number]
