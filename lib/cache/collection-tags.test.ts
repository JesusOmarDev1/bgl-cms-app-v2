import { describe, expect, it } from "vitest"
import { tagsForCollection } from "@/app/api/cache/invalidate/collection-tags"

describe("cache invalidation tags", () => {
  it("invalidates every page embedding an edited SEO record", () => {
    expect(tagsForCollection("seo")).toEqual(
      expect.arrayContaining([
        "seo",
        "pages_by_slug",
        "services_by_slug",
        "manuals_by_slug",
        "blog_posts_by_slug",
        "products_by_slug",
        "services_button",
      ])
    )
  })

  it("retains the existing page and block mappings", () => {
    expect(tagsForCollection("pages")).toContain("pages_count")
    expect(tagsForCollection("cta_block")).toContain("manuals_by_slug")
    expect(tagsForCollection("pages_body")).toBeUndefined()
  })
})
