export const ProductWarrantyEnum = [
  "no_warranty",
  "30_days",
  "90_days",
  "6_months",
  "1_year",
] as const
export type ProductWarranty = (typeof ProductWarrantyEnum)[number]
