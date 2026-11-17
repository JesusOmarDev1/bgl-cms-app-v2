import { describe, expect, it } from "vitest"
import {
  buildCatalogHierarchy,
  getCatalogNavigationStage,
  getCatalogCategoryParam,
  findCatalogHierarchyCategory,
  filterCatalogProducts,
  getCatalogCategoryAncestors,
  normalizeCatalogFilterParams,
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

  it("handles facet URL values, invalid filters, and clearing", () => {
    const product = (
      id: string,
      dateCreated: string,
      brand: string | null,
      capacity: number | null,
      division: number | null
    ) => ({
      id,
      title: id,
      excerpt: null,
      description: null,
      dateCreated,
      categorySlug: "scales",
      brand,
      capacity,
      division,
    })
    const products = [
      product("torrey", "2024-01-04", "Torrey", 30, 5),
      product("all-brand", "2024-01-02", "all", 10, 1),
      product("other-brand", "2024-01-03", "Other", 20, 2),
      product("untyped", "2024-01-01", null, null, null),
    ]
    const ids = (url: string) =>
      filterCatalogProducts(
        products,
        "",
        "scales",
        "newest",
        new URLSearchParams(url)
      ).map((product) => product.id)

    expect(ids("brand=Torrey&capacity=30&division=5")).toEqual(["torrey"])
    expect(ids("brand=all")).toEqual(["all-brand"])
    expect(ids("capacity=null&division=null")).toEqual([
      "torrey",
      "other-brand",
      "all-brand",
      "untyped",
    ])
    expect(ids("cat=scales&type=industrial")).toEqual([
      "torrey",
      "other-brand",
      "all-brand",
      "untyped",
    ])
    expect(
      normalizeCatalogFilterParams(
        products,
        new URLSearchParams(
          "cat=scales&type=industrial&brand=missing&capacity=30&division=bad"
        )
      ).toString()
    ).toBe("cat=scales&type=industrial&capacity=30")
  })

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

describe("getCatalogNavigationStage", () => {
  it("resolves entry, category, and type stages from shareable slugs", () => {
    expect(getCatalogNavigationStage("", "")).toBe("categories")
    expect(getCatalogNavigationStage("scales", "")).toBe("types")
    expect(getCatalogNavigationStage("scales", "industrial")).toBe("products")
  })
})

describe("catalog category references", () => {
  it("uses slugs when available and a stable ID reference otherwise", () => {
    const hierarchy = [
      {
        id: "category-without-slug",
        slug: null,
        title: "Published category",
        imageId: null,
        types: [],
        untypedProductCount: 0,
      },
      {
        id: "scales-id",
        slug: "scales",
        title: "Scales",
        imageId: null,
        types: [],
        untypedProductCount: 0,
      },
    ]

    expect(getCatalogCategoryParam(hierarchy[0])).toBe(
      "id:category-without-slug"
    )
    expect(
      findCatalogHierarchyCategory(hierarchy, "id:category-without-slug")
    ).toBe(hierarchy[0])
    expect(getCatalogCategoryParam(hierarchy[1])).toBe("scales")
    expect(findCatalogHierarchyCategory(hierarchy, "scales")).toBe(hierarchy[1])
  })
})

describe("buildCatalogHierarchy", () => {
  it("shows empty categories and scopes types and untyped products to their category", () => {
    const hierarchy = buildCatalogHierarchy(
      [
        { id: "c1", slug: "scales", title: "Básculas", image: { id: "img1" } },
        { id: "c2", slug: null, title: "Sin slug", image: null },
        { id: "c3", slug: "empty", title: "Vacía", image: null },
      ],
      [
        {
          id: "t1",
          slug: "industrial",
          title: "Industriales",
          category: "c1",
          image: null,
        },
        {
          id: "t2",
          slug: "other",
          title: "Otro",
          category: "c2",
          image: { id: "img2" },
        },
      ],
      [
        { categoryId: "c1", typeId: "t1" },
        { categoryId: "c1", typeId: null },
        { categoryId: "c2", typeId: "t1" },
      ]
    )

    expect(hierarchy).toEqual([
      {
        id: "c1",
        slug: "scales",
        title: "Básculas",
        imageId: "img1",
        types: [
          {
            id: "t1",
            slug: "industrial",
            title: "Industriales",
            imageId: null,
          },
        ],
        untypedProductCount: 1,
      },
      {
        id: "c2",
        slug: null,
        title: "Sin slug",
        imageId: null,
        types: [{ id: "t2", slug: "other", title: "Otro", imageId: "img2" }],
        untypedProductCount: 0,
      },
      {
        id: "c3",
        slug: "empty",
        title: "Vacía",
        imageId: null,
        types: [],
        untypedProductCount: 0,
      },
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
