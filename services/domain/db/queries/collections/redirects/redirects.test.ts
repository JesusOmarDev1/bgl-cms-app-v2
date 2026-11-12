import { beforeEach, describe, expect, it, vi } from "vitest"

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@directus/sdk", () => ({
  aggregate: vi.fn(),
  readItems: vi.fn((_collection: string, query: object) => query),
}))
vi.mock("@/config/directus-public", () => ({ publicDirectus: { request } }))
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock("@/lib/directus/query-error", () => ({
  returnDirectusQueryError: vi.fn(),
}))

import { getRedirectsQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

describe("getRedirectsQuery", () => {
  beforeEach(() => request.mockReset())

  it("supports paginated exact-origin queries", async () => {
    request.mockResolvedValueOnce([{ id: "matching" }])

    await getRedirectsQuery({ limit: 200, page: 2, origin: "/old" }, "failed")

    expect(request).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        limit: 200,
        page: 2,
        filter: { origin: { _eq: "/old" } },
      })
    )
  })

  it("propagates a failed endpoint query instead of returning a partial index", async () => {
    request.mockRejectedValueOnce(new Error("Directus unavailable"))

    await expect(
      getRedirectsQuery({ origin: "/old", throwOnError: true }, "failed")
    ).rejects.toThrow("Directus unavailable")
  })

  it("returns an empty result when the main query fails", async () => {
    request.mockRejectedValueOnce(new Error("Directus unavailable"))

    await expect(
      getRedirectsQuery({ origin: "/old" }, "failed")
    ).resolves.toEqual([])
    expect(request).toHaveBeenCalledTimes(1)
  })
})
