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
type CatalogHierarchyType = Omit<
  CatalogHierarchy["types"][number],
  "imageId"
> & {
  category: string
  image: { id: string } | null
}
type CatalogHierarchyProduct = {
  categoryId: string | null
  typeId: string | null
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
  return categories.map((category) => {
    const categoryTypes = types
      .filter((type) => type.category === category.id)
      .map(({ id, slug, title, image }) => ({
        id,
        slug,
        title,
        imageId: image?.id ?? null,
      }))

    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      imageId: category.image?.id ?? null,
      types: categoryTypes,
      untypedProductCount: products.filter(
        (product) =>
          product.categoryId === category.id && product.typeId === null
      ).length,
    }
  })
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
}

type CatalogFields = Pick<
  CatalogItem,
  | "title"
  | "excerpt"
  | "description"
  | "dateCreated"
  | "categorySlug"
  | "categoryAncestors"
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
    ? products.filter(
        (product) =>
          product.categorySlug === category ||
          product.categoryAncestors?.includes(category)
      )
    : [...products]
  const searched = fuzzySearch(scoped, query, {
    keys: ["title", "excerpt", "description"],
  })
  return sortCatalogProducts(searched, sort)
}
