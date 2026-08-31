import type { StatusType } from "@/types/enums/status-type"

export type ProductAttributeUnit =
  | "kilograms"
  | "grams"
  | "pounds"
  | "milligrams"
  | "micrograms"
  | "nanograms"
  | "liters"
  | "gallons"
  | "meters"
  | "centimeters"
  | "amperes"
  | "volts"
  | "kelvins"
  | "seconds"
  | "minutes"
  | "hours"

export type ProductAttributeGroup = "general" | "specs" | "functions" | "others"

export type ProductAttributeType = "pdf" | "image" | "video" | "text"

export interface ProductAttributesTypes {
  // General
  id: string
  title: string
  slug: string | null
  units: ProductAttributeUnit
  value: string
  group: ProductAttributeGroup
  sort: number | null
  type: ProductAttributeType
  status: StatusType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
