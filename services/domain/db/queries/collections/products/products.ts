import "server-only"

import type { ApplyQueryFields, Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { getCatalogCategoryAncestors } from "@/components/collections/catalog/catalog-items"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import {
  PRODUCT_CATALOG_CATEGORY_FIELDS,
  PRODUCT_CATALOG_FIELDS,
  PRODUCTS_FIELDS,
} from "@/services/domain/db/queries/collections/products/products.fields"
import type { ProductsTypes } from "@/types/collections/products"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ProductsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const CATALOG_BATCH_SIZE = 200
type ProductCatalogRow = ApplyQueryFields<
  Schema,
  ProductsTypes,
  typeof PRODUCT_CATALOG_FIELDS
>
type ProductCategoryCatalogRow = ApplyQueryFields<
  Schema,
  ProductCategoriesTypes,
  typeof PRODUCT_CATALOG_CATEGORY_FIELDS
>

async function fetchCatalogProducts() {
  "use cache"
  cacheTag("products", "product_categories")
  cacheLife("minutes")

  const products: ProductCatalogRow[] = []
  const categoryRows: ProductCategoryCatalogRow[] = []
  for (let page = 1; ; page += 1) {
    const batch = await directus.request(
      readItems("products", {
        fields: PRODUCT_CATALOG_FIELDS,
        limit: CATALOG_BATCH_SIZE,
        page,
        sort: ["-date_created", "id"],
        filter: { status: { _eq: "published" } },
      } satisfies Query<Schema, ProductsTypes>)
    )
    products.push(...batch)
    if (batch.length < CATALOG_BATCH_SIZE) break
  }
  for (let page = 1; ; page += 1) {
    const batch = await directus.request(
      readItems("product_categories", {
        fields: PRODUCT_CATALOG_CATEGORY_FIELDS,
        limit: CATALOG_BATCH_SIZE,
        page,
        filter: { status: { _eq: "published" } },
      } satisfies Query<Schema, ProductCategoriesTypes>)
    )
    categoryRows.push(...batch)
    if (batch.length < CATALOG_BATCH_SIZE) break
  }
  const categoryAncestors = getCatalogCategoryAncestors(
    categoryRows.map((category) => ({
      id: category.id,
      slug: category.slug,
      parentId: category.parent?.id ?? null,
    }))
  )
  return { products, categoryAncestors }
}

export async function getProductCatalogQuery(failedToFetchMessage: string) {
  try {
    return await fetchCatalogProducts()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductCatalogQuery",
      collection: "products",
    })
    throw error
  }
}

async function fetchProducts(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("products")
  cacheLife("minutes")
  return directus.request(
    readItems("products", {
      fields: PRODUCTS_FIELDS,
      deep: {
        related_products: {
          _filter: {
            related_products_id: {
              status: { _eq: status },
            },
          },
        },
      },
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ProductsTypes>)
  )
}

export async function getProductsQuery(
  query: ProductsQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchProducts(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductsQuery",
      collection: "products",
    })
    return []
  }
}

async function fetchProductsBySlug(
  status: StatusType,
  limit: number,
  page: number,
  slug: string
) {
  "use cache"
  cacheTag("products_by_slug")
  cacheLife("minutes")
  return directus.request(
    readItems("products", {
      fields: PRODUCTS_FIELDS,
      deep: {
        related_products: {
          _filter: {
            related_products_id: {
              status: { _eq: status },
            },
          },
        },
      },
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status }, slug: { _eq: slug } },
    } satisfies Query<Schema, ProductsTypes>)
  )
}

export async function getProductsBySlugQuery(
  query: ProductsQuery,
  slug: string,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  try {
    return await fetchProductsBySlug(status, limit, page, slug)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductsBySlugQuery",
      collection: "products",
    })
    throw error
  }
}

async function fetchProductsCount(status: StatusType) {
  "use cache"
  cacheTag("products_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("products", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getProductsCountQuery(
  query: Pick<ProductsQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchProductsCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductsCountQuery",
      collection: "products",
    })
    return 0
  }
}

export type ProductsQueryResult = Awaited<ReturnType<typeof getProductsQuery>>
export type ProductsCountQueryResult = Awaited<
  ReturnType<typeof getProductsCountQuery>
>
