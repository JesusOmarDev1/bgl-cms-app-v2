import { beforeEach, describe, expect, it, vi } from "vitest"

const { request, publicRequest, createPrivateDirectus } = vi.hoisted(() => ({
  request: vi.fn(), publicRequest: vi.fn(), createPrivateDirectus: vi.fn(async (_token: string) => ({ request })),
}))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({ readItems: vi.fn((collection: string, query: object) => ({ collection, ...query })) }))
vi.mock("@/config/directus-private", () => ({ createPrivateDirectus }))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request: publicRequest } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { getPrivateModelsRepository } from "@/services/domain/db/repositories/collections/private-models"
import { getModelsQuery } from "@/services/domain/db/queries/collections/models/models"

describe("private model repository", () => {
  beforeEach(() => { request.mockReset(); publicRequest.mockReset(); createPrivateDirectus.mockClear() })

  it("uses explicit projection, employee token, server-side search and limit+1 pagination", async () => {
    const models = [{ id: "1", title: "Model 1" }, { id: "2", title: "Model 2" }, { id: "3", title: "Model 3" }]
    request.mockResolvedValue(models)
    await expect(getPrivateModelsRepository({ accessToken: "employee-b", search: "Model", limit: 2, page: 2 })).resolves.toEqual({ items: models.slice(0, 2), hasNextPage: true })
    expect(createPrivateDirectus).toHaveBeenCalledWith("employee-b")
    expect(request).toHaveBeenCalledWith({ collection: "models", fields: ["id", "title"], filter: { title: { _icontains: "Model" } }, limit: 3, offset: 2, sort: ["title", "id"] })
  })

  it.each([{ limit: 0 }, { limit: 101 }, { limit: 1.5 }, { page: 0 }, { page: 1.5 }])("rejects invalid pagination: %o", async (query) => {
    await expect(getPrivateModelsRepository({ accessToken: "employee-b", ...query })).rejects.toThrow()
    expect(createPrivateDirectus).not.toHaveBeenCalled(); expect(request).not.toHaveBeenCalled()
  })

  it("preserves public query behavior and propagates denial", async () => {
    const rows = [{ id: "public", title: "Public" }]
    publicRequest.mockResolvedValue(rows)
    await expect(getModelsQuery({}, "failed")).resolves.toEqual(rows)
    expect(publicRequest.mock.calls[0][0]).toMatchObject({ collection: "models", limit: 10, page: 1, sort: ["-date_created"], filter: { status: { _eq: "published" } } })
    request.mockRejectedValue(new Error("FORBIDDEN"))
    await expect(getPrivateModelsRepository({ accessToken: "employee-b" })).rejects.toThrow("FORBIDDEN")
  })

  it("returns a real empty result", async () => {
    request.mockResolvedValue([])
    await expect(getPrivateModelsRepository({ accessToken: "employee-b" })).resolves.toEqual({ items: [], hasNextPage: false })
  })
})
