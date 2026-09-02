export const ProductAttributeTypeEnum = [
  "pdf",
  "image",
  "video",
  "text",
] as const
export type ProductAttributeType = (typeof ProductAttributeTypeEnum)[number]
