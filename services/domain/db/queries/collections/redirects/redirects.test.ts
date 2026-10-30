import { beforeEach, describe, expect, it, vi } from "vitest"

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  aggregate: vi.fn(),
  readItems: vi.fn((_collection: string, query: object) => query),
}))
vi.mock("@/config/directus", () => ({ default: { request } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock("@/lib/directus/query-error", () => ({
  returnDirectusQueryError: vi.fn(),
}))

import { getRedirectIndexQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

describe("getRedirectIndexQuery", () => {
  beforeEach(() => request.mockReset())

  it("loads compact records in 200-row pages ordered by newest then ID", async () => {
    request.mockResolvedValueOnce(Array.from({ length: 200 }, (_, id) => ({ id })))
    request.mockResolvedValueOnce([{ id: 201 }])

    const rows = await getRedirectIndexQuery("failed")

    expect(rows).toHaveLength(201)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls.map(([query]) => query)).toEqual([
      expect.objectContaining({
        fields: ["id", "origin", "destiny", "http_code"],
        limit: 200,
        page: 1,
        sort: ["-date_created", "id"],
      }),
      expect.objectContaining({ page: 2 }),
    ])
  })

  it("filters the redirect index by origin when provided", async () => {
    request.mockResolvedValueOnce([{ id: "matching" }])

    await getRedirectIndexQuery("failed", "/old")

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { origin: { _eq: "/old" } },
      })
    )
  })

  it("rejects a failed later page instead of returning a partial index", async () => {
    request.mockResolvedValueOnce(Array.from({ length: 200 }, () => ({})))
    request.mockRejectedValueOnce(new Error("Directus unavailable"))

    await expect(getRedirectIndexQuery("failed")).rejects.toThrow(
      "Directus unavailable"
    )
  })
})
