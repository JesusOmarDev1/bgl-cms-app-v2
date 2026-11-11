import { beforeEach, describe, expect, it, vi } from "vitest"

const { getRedirectsQuery } = vi.hoisted(() => ({
  getRedirectsQuery: vi.fn(),
}))
vi.mock("@/services/domain/db/queries/collections/redirects/redirects", () => ({
  getRedirectsQuery,
}))

import { GET } from "@/app/api/redirects/route"

describe("GET /api/redirects", () => {
  beforeEach(() => getRedirectsQuery.mockReset())

  it.each([null, "", "https://evil.example/path", "//evil.example/path", "/bad\\path"])(
    "rejects missing or invalid origin %s without querying",
    async (origin) => {
      const url = new URL("https://example.com/api/redirects")
      if (origin !== null) url.searchParams.set("origin", origin)

      const response = await GET(new Request(url))

      expect(response.status).toBe(400)
      expect(getRedirectsQuery).not.toHaveBeenCalled()
    }
  )

  it("uses the main query for an exact origin and includes redirects beyond row 200", async () => {
    const url = new URL("https://example.com/api/redirects?origin=%2Fold")
    const firstPage = Array.from({ length: 200 }, (_, id) => ({ id }))
    const finalRow = { id: 201, origin: "/old", destiny: "/new", http_code: "301" }
    getRedirectsQuery.mockResolvedValueOnce(firstPage).mockResolvedValueOnce([finalRow])

    const response = await GET(new Request(url))

    expect(getRedirectsQuery).toHaveBeenNthCalledWith(
      1,
      { limit: 200, page: 1, origin: "/old", throwOnError: true },
      "Error al obtener las redirecciones."
    )
    expect(getRedirectsQuery).toHaveBeenNthCalledWith(
      2,
      { limit: 200, page: 2, origin: "/old", throwOnError: true },
      "Error al obtener las redirecciones."
    )
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(await response.json()).toEqual([...firstPage, finalRow])
  })

  it("does not return partial redirects when a later page fails", async () => {
    const firstPage = Array.from({ length: 200 }, (_, id) => ({ id }))
    getRedirectsQuery.mockResolvedValueOnce(firstPage).mockRejectedValueOnce(new Error("CMS down"))

    const response = await GET(new Request("https://example.com/api/redirects?origin=%2Fold"))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: "Redirects unavailable." })
  })
})
