import { beforeEach, describe, expect, it, vi } from "vitest"

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  aggregate: vi.fn(),
  readItems: vi.fn((collection: string, query: object) => ({
    collection,
    ...query,
  })),
}))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock("@/lib/directus/query-error", () => ({
  returnDirectusQueryError: vi.fn(),
}))

import { getProductCatalogQuery } from "@/services/domain/db/queries/collections/products/products"

describe("getProductCatalogQuery", () => {
  beforeEach(() => {
    request.mockReset().mockResolvedValue([])
  })

  it("reads published products, categories with photos, and category-scoped types", async () => {
    await expect(getProductCatalogQuery("failed")).resolves.toMatchObject({
      products: [],
      categories: [],
      types: [],
    })

    expect(request).toHaveBeenCalledTimes(3)
    const [products, categories, types] = request.mock.calls.map(
      ([query]) => query
    )
    expect(products).toMatchObject({
      collection: "products",
      filter: { status: { _eq: "published" } },
    })
    expect(products.fields).toContainEqual({ product_type: ["id", "slug"] })
    expect(categories).toMatchObject({
      collection: "product_categories",
      filter: { status: { _eq: "published" } },
    })
    expect(categories.fields).toContainEqual({ image: ["id"] })
    expect(types).toMatchObject({
      collection: "product_types",
      filter: { status: { _eq: "published" } },
    })
    expect(types.fields).toContainEqual({ category: ["id"] })
    expect(types.fields).toContainEqual({ image: ["id"] })
  })
})
