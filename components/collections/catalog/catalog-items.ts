import { fuzzySearch } from "@/config/search"

export const CATALOG_SORTS = ["newest", "oldest", "a-z", "z-a"] as const

export type CatalogSort = (typeof CATALOG_SORTS)[number]

export type CatalogItem = {
  id: string
  title: string
  excerpt: string | null
  description: string | null
  dateCreated: string
  categorySlug: string | null
  categoryTitle: string | null
}

type CatalogFields = Pick<
  CatalogItem,
  "title" | "excerpt" | "description" | "dateCreated" | "categorySlug"
>

export function sortCatalogProducts<T extends CatalogFields>(
  products: readonly T[],
  sort: CatalogSort
): T[] {
  const next = [...products]
  if (sort === "a-z" || sort === "z-a") {
    next.sort((a, b) =>
      a.title.localeCompare(b.title, "es", { sensitivity: "base" })
    )
    if (sort === "z-a") next.reverse()
    return next
  }
  next.sort((a, b) => a.dateCreated.localeCompare(b.dateCreated))
  if (sort === "newest") next.reverse()
  return next
}

export function filterCatalogProducts<T extends CatalogFields>(
  products: readonly T[],
  query: string,
  category: string,
  sort: CatalogSort
): T[] {
  const scoped = category
    ? products.filter((product) => product.categorySlug === category)
    : [...products]
  const searched = fuzzySearch(scoped, query, {
    keys: ["title", "excerpt", "description"],
  })
  return sortCatalogProducts(searched, sort)
}

function expectCatalogProducts() {
  const rows = [
    {
      title: "b",
      excerpt: null,
      description: "alpha",
      dateCreated: "2020-01-02T00:00:00.000Z",
      categorySlug: "x",
    },
    {
      title: "a",
      excerpt: "beta",
      description: null,
      dateCreated: "2020-01-03T00:00:00.000Z",
      categorySlug: "y",
    },
  ]
  const newest = filterCatalogProducts(rows, "", "", "newest")
  const oldest = filterCatalogProducts(rows, "", "", "oldest")
  const alpha = filterCatalogProducts(rows, "", "y", "a-z")
  const reverse = filterCatalogProducts(rows, "", "", "z-a")
  if (
    newest[0]?.title !== "a" ||
    oldest[0]?.title !== "b" ||
    alpha.length !== 1 ||
    alpha[0]?.title !== "a" ||
    reverse[0]?.title !== "b"
  ) {
    throw new Error("catalog products self-check failed")
  }
}

expectCatalogProducts()
