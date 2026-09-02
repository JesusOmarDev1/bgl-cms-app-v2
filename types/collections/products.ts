import type { StatusType } from "@/types/enums/status-type"
import type { ProductCatalogState } from "@/types/enums/product-catalog-state"
import type { ProductEquipmentType } from "@/types/enums/product-equipment-type"
import type { ProductWarranty } from "@/types/enums/product-warranty"
import type { ProductWeightUnit } from "@/types/enums/product-weight-unit"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { SeoTypes } from "@/types/collections/seo"
import type { BrandsTypes } from "@/types/collections/brands"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { ModelsTypes } from "@/types/collections/models"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { ProductsFilesJunction } from "@/types/collections/junctions/products-files"
import type { ProductsProductAttributesJunction } from "@/types/collections/junctions/products-product-attributes"
import type { ProductsProductsJunction } from "@/types/collections/junctions/products-products"
import type { ProductsTagsJunction } from "@/types/collections/junctions/products-tags"

export interface ProductsTypes {
  // General
  id: string
  slug: string | null
  weight: number | null
  seo_title: string | null
  seo_description: string | null
  brand: string | BrandsTypes
  supplier: string | SuppliersTypes | null
  model: string | ModelsTypes | null
  seo: string | SeoTypes
  title: string
  featured_image: string | null
  published_at: "datetime"
  status: StatusType
  state: ProductCatalogState | null
  width: number | null
  height: number | null
  temperature: number | null
  depth: number | null
  capacity: number
  power: string | null
  equipment_type: ProductEquipmentType
  division: number
  units: ProductWeightUnit
  warranty: ProductWarranty
  excerpt: string | null
  image: string | DirectusFileTypes
  description: string | null
  product_category: string | ProductCategoriesTypes
  attributes: number[] | ProductsProductAttributesJunction[]
  images: number[] | ProductsFilesJunction[]
  related_products: number[] | ProductsProductsJunction[]
  tags: number[] | ProductsTagsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
