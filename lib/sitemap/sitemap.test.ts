import { describe, expect, it, vi } from "vitest"

const { getPagesRepository } = vi.hoisted(() => ({
  getPagesRepository: vi.fn(),
}))
vi.mock("@/services/domain/db/repositories/collections/pages", () => ({
  getPagesRepository,
}))
vi.mock("@/services/domain/db/repositories/collections/services", () => ({
  getServicesRepository: vi.fn(),
}))
vi.mock("@/services/domain/db/repositories/collections/blog-posts", () => ({
  getBlogPostsRepository: vi.fn(),
}))
vi.mock("@/services/domain/db/repositories/collections/products", () => ({
  getProductsRepository: vi.fn(),
}))
vi.mock("@/services/domain/db/repositories/collections/manuals", () => ({
  getManualsRepository: vi.fn(),
}))
vi.mock("@/lib/env/constants", () => ({ WEBSITE_URL: "https://example.com" }))

import { sitemapRegistry } from "@/config/sitemap"

describe("sitemapRegistry", () => {
  it("includes the 201st published page", async () => {
    getPagesRepository
      .mockResolvedValueOnce(
        Array.from({ length: 200 }, (_, index) => ({ slug: `page-${index}` }))
      )
      .mockResolvedValueOnce([{ slug: "page-201" }])

    const entries = await sitemapRegistry.pages.entries()

    expect(entries).toHaveLength(201)
    expect(entries.at(-1)?.url).toBe("https://example.com/page-201")
    expect(getPagesRepository).toHaveBeenNthCalledWith(1, {
      limit: 200,
      page: 1,
    })
    expect(getPagesRepository).toHaveBeenNthCalledWith(2, {
      limit: 200,
      page: 2,
    })
  })

  it("retains the existing static legal entries", async () => {
    expect(await sitemapRegistry.static.entries()).toHaveLength(4)
  })
})
