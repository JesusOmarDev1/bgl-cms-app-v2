import { describe, expect, it } from "vitest"
import { toSearchCommandItem } from "@/components/shared/search/map-search-hit"

const hit = {
  id: "1",
  collection: "pages",
  title: "Page",
  excerpt: "Excerpt",
  slug: "page",
  url: "/page",
  image: null,
}

describe("toSearchCommandItem", () => {
  it("rejects an executable search URL", () => {
    for (const url of ["javascript:alert(1)", "//evil.example", "/\\evil.example"]) {
      expect(toSearchCommandItem({ ...hit, url })).toBeNull()
    }
  })

  it("keeps an internal search result navigable", () => {
    expect(toSearchCommandItem(hit)).toMatchObject({ id: "pages:1", label: "Page" })
  })
})
