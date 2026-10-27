export const ProductEquipmentTypeEnum = [
  "scale",
  "consumables",
  "indicator",
  "labeling_indicator",
] as const
export type ProductEquipmentType = (typeof ProductEquipmentTypeEnum)[number]
