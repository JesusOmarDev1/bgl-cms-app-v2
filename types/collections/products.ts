import type { StatusType } from "@/types/enums/status-type"
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

export type ProductEquipmentType = "scale" | "consumables"

export type ProductWeightUnit =
  "kilograms" | "grams" | "pounds" | "milligrams" | "micrograms" | "nanograms"

export type ProductWarranty =
  "no_warranty" | "30_days" | "90_days" | "6_months" | "1_year"

export type ProductCatalogState =
  "active" | "discontinued" | "out_of_stock" | "coming_soon"

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
  sort: number | null
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
