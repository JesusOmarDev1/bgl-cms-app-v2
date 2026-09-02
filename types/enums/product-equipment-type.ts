export const ProductEquipmentTypeEnum = ["scale", "consumables"] as const
export type ProductEquipmentType = (typeof ProductEquipmentTypeEnum)[number]
