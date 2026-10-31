import { describe, expect, it } from "vitest"
import {
  filterCatalogProducts,
  getCatalogCategoryAncestors,
} from "@/components/collections/catalog/catalog-items"

describe("filterCatalogProducts", () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
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
