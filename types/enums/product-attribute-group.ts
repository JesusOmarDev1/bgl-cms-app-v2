export const ProductAttributeGroupEnum = [
  "general",
  "specs",
  "functions",
  "others",
] as const
export type ProductAttributeGroup = (typeof ProductAttributeGroupEnum)[number]
