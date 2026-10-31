import { describe, expect, it } from "vitest"
import {
  filterCatalogProducts,
  getCatalogCategoryAncestors,
} from "@/components/collections/catalog/catalog-items"

describe("filterCatalogProducts", () => {
  it("preserves date, title, and category sorting", () => {
    const products = [
      {
        id: "older-b",
        title: "Beta",
        excerpt: null,
        description: null,
        dateCreated: "2020-01-02T00:00:00.000Z",
        categorySlug: "other",
      },
      {
        id: "newer-a",
        title: "Alpha",
        excerpt: "beta",
        description: null,
        dateCreated: "2020-01-03T00:00:00.000Z",
        categorySlug: "child",
        categoryAncestors: ["parent"],
      },
      {
        id: "newer-c",
        title: "Charlie",
        excerpt: null,
        description: "alpha",
        dateCreated: "2020-01-03T00:00:00.000Z",
        categorySlug: "parent",
      },
    ]

    expect(
      filterCatalogProducts(products, "", "", "newest").map((item) => item.id)
    ).toEqual(["newer-c", "newer-a", "older-b"])
    expect(
      filterCatalogProducts(products, "", "", "oldest").map((item) => item.id)
    ).toEqual(["older-b", "newer-a", "newer-c"])
    expect(
      filterCatalogProducts(products, "", "parent", "a-z").map(
        (item) => item.id
      )
    ).toEqual(["newer-a", "newer-c"])
    expect(
      filterCatalogProducts(products, "", "", "z-a").map((item) => item.id)
    ).toEqual(["newer-c", "older-b", "newer-a"])
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
