import type { Query } from "@directus/sdk"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { ProductsTypes } from "@/types/collections/products"
import type { Schema } from "@/types/schema"

export const PRODUCT_CATALOG_FIELDS = [
  "id",
  "slug",
  "title",
  "excerpt",
  "description",
  "date_created",
  { image: ["id"] },
  { brand: ["title"] },
  { model: ["title"] },
  { product_category: ["id", "title", "slug", "icon"] },
] as const satisfies NonNullable<Query<Schema, ProductsTypes>["fields"]>

export const PRODUCT_CATALOG_CATEGORY_FIELDS = [
  "id",
  "slug",
  { parent: ["id"] },
] as const satisfies NonNullable<
  Query<Schema, ProductCategoriesTypes>["fields"]
>

export const PRODUCTS_FIELDS = [
  "id",
  "slug",
  "weight",
  "title",
  "published_at",
  "status",
  "state",
  "width",
  "height",
  "temperature",
  "depth",
  "capacity",
  "power",
  "equipment_type",
  "division",
  "units",
  "warranty",
  "excerpt",
  "description",
  "date_created",
  "date_updated",
  { image: ["*"] },
  { seo: SEO_FIELDS },
  {
    brand: [
      "id",
      "title",
      "excerpt",
      "slug",
      "date_created",
      "date_updated",
      { logo: ["*"] },
    ],
  },
  {
    supplier: [
      "id",
      "name",
      "status",
      "active",
      "website",
      "slug",
      "date_created",
      "date_updated",
      { logo: ["*"] },
    ],
  },
  {
    model: [
      "id",
      "title",
      "slug",
      "date_created",
      "date_updated",
      { image: ["*"] },
    ],
  },
  {
    product_category: [
      "id",
      "title",
      "slug",
      "status",
      "icon",
      "date_created",
      "date_updated",
      { image: ["*"] },
      { parent: ["id", "title", "slug", "status", "icon"] },
    ],
  },
  {
    attributes: [
      "id",
      "products_id",
      {
        product_attributes_id: [
          "id",
          "title",
          "slug",
          "units",
          "value",
          "group",
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
  {
    images: ["id", "products_id", { directus_files_id: ["*"] }],
  },
  {
    related_products: [
      "id",
      "products_id",
      {
        related_products_id: [
          "id",
          "slug",
          "weight",
          "title",
          "published_at",
          "status",
          "state",
          "width",
          "height",
          "temperature",
          "depth",
          "capacity",
          "power",
          "equipment_type",
          "division",
          "units",
          "warranty",
          "excerpt",
          "description",
          "date_created",
          "date_updated",
          { image: ["*"] },
          { brand: ["title"] },
          { model: ["title"] },
          { product_category: ["title", "slug", "status"] },
        ],
      },
    ],
  },
  {
    tags: [
      "id",
      "products_id",
      {
        tags_id: [
          "id",
          "title",
          "slug",
          "color",
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ProductsTypes>["fields"]>
