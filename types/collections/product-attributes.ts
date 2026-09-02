import type { StatusType } from "@/types/enums/status-type"
import type { ProductAttributeGroup } from "@/types/enums/product-attribute-group"
import type { ProductAttributeType } from "@/types/enums/product-attribute-type"
import type { ProductAttributeUnit } from "@/types/enums/product-attribute-unit"

export interface ProductAttributesTypes {
  // General
  id: string
  title: string
  slug: string | null
  units: ProductAttributeUnit
  value: string
  group: ProductAttributeGroup
  type: ProductAttributeType
  status: StatusType
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
