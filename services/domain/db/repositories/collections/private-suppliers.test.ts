import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, publicRequest, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(), publicRequest: vi.fn(), createPrivateDirectus: vi.fn(async (_token: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({ readItems: vi.fn((collection: string, query: object) => ({ collection, ...query })) }))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request: publicRequest } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { getPrivateSuppliersRepository } from "@/services/domain/db/repositories/collections/private-suppliers"
import { getSuppliersQuery } from "@/services/domain/db/queries/collections/suppliers/suppliers"

describe("private supplier repository", () => {
  beforeEach(() => { request.mockReset(); publicRequest.mockReset(); createPrivateDirectus.mockClear() })

  it("uses explicit projection, employee token, server-side search and limit+1 pagination", async () => {
    const suppliers = [{ id: "1", name: "Supplier 1" }, { id: "2", name: "Supplier 2" }, { id: "3", name: "Supplier 3" }]
    request.mockResolvedValue(suppliers)
    await expect(getPrivateSuppliersRepository({ accessToken: "employee-c", search: "Supplier", limit: 2, page: 2 })).resolves.toEqual({ items: suppliers.slice(0, 2), hasNextPage: true })
    expect(createPrivateDirectus).toHaveBeenCalledWith("employee-c")
    expect(request).toHaveBeenCalledWith({ collection: "suppliers", fields: ["id", "name"], filter: { name: { _icontains: "Supplier" } }, limit: 3, offset: 2, sort: ["name", "id"] })
  })

  it.each([{ limit: 0 }, { limit: 101 }, { limit: 1.5 }, { page: 0 }, { page: 1.5 }])("rejects invalid pagination: %o", async (query) => {
    await expect(getPrivateSuppliersRepository({ accessToken: "employee-c", ...query })).rejects.toThrow()
    expect(createPrivateDirectus).not.toHaveBeenCalled(); expect(request).not.toHaveBeenCalled()
  })

  it("preserves public query behavior and propagates denial", async () => {
    const rows = [{ id: "public", name: "Public" }]
    publicRequest.mockResolvedValue(rows)
    await expect(getSuppliersQuery({}, "failed")).resolves.toEqual(rows)
    expect(publicRequest.mock.calls[0][0]).toMatchObject({ collection: "suppliers", limit: 10, page: 1, sort: ["-date_created"], filter: { status: { _eq: "published" } } })
    request.mockRejectedValue(new Error("FORBIDDEN"))
    await expect(getPrivateSuppliersRepository({ accessToken: "employee-c" })).rejects.toThrow("FORBIDDEN")
  })

  it("returns a real empty result", async () => {
    request.mockResolvedValue([])
    await expect(getPrivateSuppliersRepository({ accessToken: "employee-c" })).resolves.toEqual({ items: [], hasNextPage: false })
  })
})
