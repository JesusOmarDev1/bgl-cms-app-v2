export const ProductAttributeUnitEnum = [
  "kilograms",
  "grams",
  "pounds",
  "milligrams",
  "micrograms",
  "nanograms",
  "liters",
  "gallons",
  "meters",
  "centimeters",
  "amperes",
  "volts",
  "kelvins",
  "seconds",
  "minutes",
  "hours",
] as const
export type ProductAttributeUnit = (typeof ProductAttributeUnitEnum)[number]
