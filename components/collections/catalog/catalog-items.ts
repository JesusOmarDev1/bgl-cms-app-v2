import { fuzzySearch } from "@/config/search"

export const CATALOG_SORTS = ["newest", "oldest", "a-z", "z-a"] as const

export type CatalogSort = (typeof CATALOG_SORTS)[number]

export type CatalogCategoryPath = {
  id: string
  slug: string | null
  parentId: string | null
}

export type CatalogHierarchy = {
  id: string
  slug: string | null
  title: string
  imageId: string | null
  types: {
    id: string
    slug: string
    title: string
    icon: string | null
    imageId: string | null
  }[]
  untypedProductCount: number
}

type CatalogHierarchyCategory = Pick<
  CatalogHierarchy,
  "id" | "slug" | "title"
> & {
  image: { id: string } | null
}
type CatalogHierarchyType = {
  id: string
  slug: string
  title: string
  icon?: string | null
  category: string
  image: { id: string } | null
}
type CatalogHierarchyProduct = {
  categoryId: string | null
  typeId: string | null
}

export function getCatalogCategoryParam(
  category: Pick<CatalogHierarchy, "id" | "slug">
): string {
  return category.slug || `id:${category.id}`
}

export function findCatalogHierarchyCategory(
  hierarchy: readonly CatalogHierarchy[],
  categoryParam: string
): CatalogHierarchy | undefined {
  if (categoryParam.startsWith("id:")) {
    const id = categoryParam.slice(3)
    return hierarchy.find((category) => !category.slug && category.id === id)
  }
  return hierarchy.find((category) => category.slug === categoryParam)
}

export function getCatalogNavigationStage(
  categorySlug: string,
  typeSlug: string
): "categories" | "types" | "products" {
  if (!categorySlug) return "categories"
  return typeSlug ? "products" : "types"
}

export function buildCatalogHierarchy(
  categories: readonly CatalogHierarchyCategory[],
  types: readonly CatalogHierarchyType[],
  products: readonly CatalogHierarchyProduct[]
): CatalogHierarchy[] {
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    imageId: category.image?.id ?? null,
    types: types
      .filter((type) => type.category === category.id)
      .map(({ id, slug, title, icon, image }) => ({
        id,
        slug,
        title,
        icon: icon ?? null,
        imageId: image?.id ?? null,
      })),
    untypedProductCount: products.filter(
      (product) => product.categoryId === category.id && product.typeId === null
    ).length,
  }))
}

export function getCatalogCategoryAncestors(
  categories: readonly CatalogCategoryPath[]
): Record<string, string[]> {
  const byId = new Map(categories.map((category) => [category.id, category]))
  return Object.fromEntries(
    categories.map((category) => {
      const ancestors: string[] = []
      const seen = new Set([category.id])
      let parentId = category.parentId
      while (parentId && !seen.has(parentId)) {
        seen.add(parentId)
        const parent = byId.get(parentId)
        if (!parent) break
        if (parent.slug) ancestors.push(parent.slug)
        parentId = parent.parentId
      }
      return [category.id, ancestors]
    })
  )
}

export type CatalogItem = {
  id: string
  title: string
  excerpt: string | null
  description: string | null
  dateCreated: string
  categorySlug: string | null
  categoryTitle: string | null
  categoryIcon?: string | null
  categoryAncestors?: readonly string[]
  brand?: string | null
  capacity?: number | null
  division?: number | null
}

type CatalogFields = Pick<
  CatalogItem,
  | "title"
  | "excerpt"
  | "description"
  | "dateCreated"
  | "categorySlug"
  | "categoryAncestors"
  | "brand"
  | "capacity"
  | "division"
>

const CATALOG_FILTER_KEYS = ["brand", "capacity", "division"] as const

export type CatalogFilters = Partial<
  Record<(typeof CATALOG_FILTER_KEYS)[number], string>
>

function sortCatalogProducts<T extends CatalogFields>(
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

export function normalizeCatalogFilters<T extends CatalogFields>(
  products: readonly T[],
  filters: CatalogFilters
): CatalogFilters {
  const active: CatalogFilters = {}
  for (const key of CATALOG_FILTER_KEYS) {
    const value = filters[key]
    if (
      value &&
      products.some((product) => String(product[key] ?? "") === value)
    ) {
      active[key] = value
    }
  }
  return active
}

export function filterCatalogProducts<T extends CatalogFields>(
  products: readonly T[],
  query: string,
  category: string,
  sort: CatalogSort,
  filters: CatalogFilters = {}
): T[] {
  const scoped = category
    ? products.filter(
        (product) =>
          product.categorySlug === category ||
          product.categoryAncestors?.includes(category)
      )
    : [...products]
  const active = normalizeCatalogFilters(scoped, filters)
  const filtered = scoped.filter((product) =>
    CATALOG_FILTER_KEYS.every(
      (key) => !active[key] || String(product[key] ?? "") === active[key]
    )
  )
  return sortCatalogProducts(
    fuzzySearch(filtered, query, {
      keys: ["title", "excerpt", "description"],
    }),
    sort
  )
}
