export const MediaBlockTypeEnum = [
  "pdf",
  "image",
  "video",
  "multiple",
  "audio",
] as const
export type MediaBlockType = (typeof MediaBlockTypeEnum)[number]
