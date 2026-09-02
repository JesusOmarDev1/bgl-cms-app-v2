export const ProductWeightUnitEnum = [
  "kilograms",
  "grams",
  "pounds",
  "milligrams",
  "micrograms",
  "nanograms",
] as const
export type ProductWeightUnit = (typeof ProductWeightUnitEnum)[number]
