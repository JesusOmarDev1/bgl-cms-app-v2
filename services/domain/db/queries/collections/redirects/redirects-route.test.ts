import { beforeEach, describe, expect, it, vi } from "vitest"

const { getRedirectIndexQuery } = vi.hoisted(() => ({
  getRedirectIndexQuery: vi.fn(),
}))
vi.mock("@/services/domain/db/queries/collections/redirects/redirects", () => ({
  getRedirectIndexQuery,
}))

import { GET } from "@/app/api/redirects/route"

describe("GET /api/redirects", () => {
  beforeEach(() => getRedirectIndexQuery.mockReset())

  it.each([null, "/old"])(
    "forwards origin %s and returns uncached JSON",
    async (origin) => {
      const url = new URL("https://example.com/api/redirects")
      if (origin !== null) url.searchParams.set("origin", origin)
      const rows = [{ origin: "/old", destiny: "/new", http_code: "301" }]
      getRedirectIndexQuery.mockResolvedValueOnce(rows)

      const response = await GET(new Request(url))

      expect(getRedirectIndexQuery).toHaveBeenCalledExactlyOnceWith(
        "Error al obtener las redirecciones.",
        origin
      )
      expect(response.status).toBe(200)
      expect(response.headers.get("Cache-Control")).toBe("no-store")
      expect(await response.json()).toEqual(rows)
    }
  )
})
