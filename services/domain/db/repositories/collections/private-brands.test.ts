import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, publicRequest, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(),
  publicRequest: vi.fn(),
  createPrivateDirectus: vi.fn(async (_accessToken: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  readItems: vi.fn((collection: string, query: object) => ({
    collection,
    ...query,
  })),
}))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))
vi.mock("@/config/directus-public", () => ({
  publicDirectus: { request: publicRequest },
}))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { getPrivateBrandsRepository } from "@/services/domain/db/repositories/collections/private-brands"
import { getBrandsQuery } from "@/services/domain/db/queries/collections/brands/brands"

describe("private brand repository", () => {
  beforeEach(() => {
    request.mockReset()
    publicRequest.mockReset()
    createPrivateDirectus.mockClear()
  })

  it("uses explicit projection, employee token, server-side search and limit+1 pagination", async () => {
    const brands = Array.from({ length: 3 }, (_, i) => ({
      id: `${i}`,
      title: `Brand ${i}`,
    }))
    request.mockResolvedValue(brands)
    await expect(
      getPrivateBrandsRepository({
        accessToken: "employee-a",
        search: " Acme ",
        limit: 2,
        page: 2,
      })
    ).resolves.toEqual({ items: brands.slice(0, 2), hasNextPage: true })
    expect(createPrivateDirectus).toHaveBeenCalledWith("employee-a")
    expect(request).toHaveBeenCalledWith({
      collection: "brands",
      fields: ["id", "title"],
      filter: { title: { _icontains: "Acme" } },
      limit: 3,
      offset: 2,
      sort: ["title", "id"],
    })
  })

  it.each([
    { limit: 0 },
    { limit: 101 },
    { limit: 1.5 },
    { page: 0 },
    { page: 1.5 },
  ])("rejects invalid pagination: %o", async (query) => {
    await expect(
      getPrivateBrandsRepository({ accessToken: "employee-a", ...query })
    ).rejects.toThrow()
    expect(createPrivateDirectus).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
  })

  it("preserves public cached query behavior and propagates denial", async () => {
    const rows = [{ id: "public", title: "Public" }]
    publicRequest.mockResolvedValue(rows)
    await expect(getBrandsQuery({}, "failed")).resolves.toEqual(rows)
    expect(publicRequest.mock.calls[0][0]).toMatchObject({
      collection: "brands",
      fields: expect.any(Array),
      limit: 10,
      page: 1,
      sort: ["-date_created"],
      filter: { status: { _eq: "published" } },
    })
    request.mockRejectedValue(new Error("FORBIDDEN"))
    await expect(
      getPrivateBrandsRepository({ accessToken: "employee-a" })
    ).rejects.toThrow("FORBIDDEN")
  })

  it("returns a real empty result", async () => {
    request.mockResolvedValue([])
    await expect(
      getPrivateBrandsRepository({ accessToken: "employee-a" })
    ).resolves.toEqual({ items: [], hasNextPage: false })
  })
})
