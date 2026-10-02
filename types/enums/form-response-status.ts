export const FormResponseStatusEnum = ["new", "read", "answered"] as const
export type FormResponseStatusType = (typeof FormResponseStatusEnum)[number]
