import { describe, expect, it } from "vitest"
import {
  filterCatalogProducts,
  getCatalogCategoryAncestors,
} from "@/components/collections/catalog/catalog-items"

describe("filterCatalogProducts", () => {
  it("filters by category and searches text before sorting", () => {
    const products = [
      {
        title: "Zulu",
        excerpt: null,
        description: "manual alpha",
        dateCreated: "2024-01-01",
        categorySlug: "manuals",
      },
      {
        title: "Alpha",
        excerpt: "manual beta",
        description: null,
        dateCreated: "2024-01-02",
        categorySlug: "other",
      },
      {
        title: "Beta",
        excerpt: null,
        description: null,
        dateCreated: "2024-01-03",
        categorySlug: "manuals",
      },
    ]

    expect(filterCatalogProducts(products, "alpha", "", "a-z")).toEqual([
      products[1],
      products[0],
    ])
    expect(filterCatalogProducts(products, "", "manuals", "newest")).toEqual([
      products[2],
      products[0],
    ])
  })
})

describe("getCatalogCategoryAncestors", () => {
  it("includes every parent slug and stops safely on cycles", () => {
    expect(
      getCatalogCategoryAncestors([
        { id: "root", slug: "root", parentId: null },
        { id: "child", slug: "child", parentId: "root" },
        { id: "grandchild", slug: "grandchild", parentId: "child" },
      ])
    ).toEqual({
      root: [],
      child: ["root"],
      grandchild: ["child", "root"],
    })

    expect(
      getCatalogCategoryAncestors([
        { id: "first", slug: "first", parentId: "second" },
        { id: "second", slug: "second", parentId: "first" },
      ])
    ).toEqual({ first: ["second"], second: ["first"] })
  })
})
