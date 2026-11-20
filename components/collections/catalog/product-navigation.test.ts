import { createElement, type ComponentType, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { describe, expect, it, vi } from "vitest"
import { ProductCatalogClients } from "@/components/collections/products/ProductCatalogClients"
import { ProductCard } from "@/components/collections/products/ProductCard"
import type { ProductCardData } from "@/components/collections/products/product-card"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import type { CatalogHierarchy } from "@/components/collections/catalog/catalog-items"

vi.mock("next/link", async () => {
  const { createElement } = await import("react")
  return {
    default: ({
      href,
      children,
      ...props
    }: {
      href: string
      children: ReactNode
    }) => createElement("a", { href, ...props }, children),
  }
})
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock("@/components/shared/assets/img/DirectusImage", async () => {
  const { createElement } = await import("react")
  return {
    DirectusImage: ({ alt, src }: { alt: string; src: string }) =>
      createElement("img", { alt, "data-directus-src": src }),
  }
})

const labels: CatalogLabels = {
  category: { label: "Category", placeholder: "Find category", all: "All" },
  search: { label: "Search products", placeholder: "Search" },
  sort: {
    label: "Sort",
    newest: "Newest",
    oldest: "Oldest",
    az: "A-Z",
    za: "Z-A",
  },
  clear: "Clear filters",
}
const navigationLabels = {
  categories: "All categories",
  untypedProducts: "Untyped products",
  emptyCategory: "This category has no types or products yet.",
  searchLabel: "Search categories",
  searchPlaceholder: "Search categories...",
}
const hierarchy: CatalogHierarchy[] = [
  {
    id: "c1",
    slug: "scales",
    title: "Scales",
    icon: null,
    imageId: "category-image",
    types: [
      {
        id: "t1",
        slug: "industrial",
        title: "Industrial",
        icon: "monitor_weight",
        imageId: null,
      },
    ],
    productCount: 2,
    untypedProductCount: 1,
  },
  {
    id: "c2",
    slug: "empty",
    title: "Empty category",
    icon: null,
    imageId: null,
    types: [],
    productCount: 0,
    untypedProductCount: 0,
  },
  {
    id: "c3",
    slug: "other",
    title: "Other category",
    icon: null,
    imageId: null,
    types: [
      { id: "t2", slug: "bench", title: "Bench", icon: null, imageId: null },
    ],
    productCount: 2,
    untypedProductCount: 1,
  },
  {
    id: "c4",
    slug: null,
    title: "No-slug category",
    icon: null,
    imageId: null,
    types: [],
    productCount: 1,
    untypedProductCount: 1,
  },
]
const item = (
  data: Partial<ProductCardData> &
    Pick<ProductCardData, "id" | "title" | "categoryId" | "productTypeId">
): ProductCardData => ({
  slug: data.id,
  excerpt: null,
  description: null,
  dateCreated: "2025-01-01",
  imageId: null,
  brand: null,
  model: null,
  capacity: null,
  division: null,
  categoryTitle: null,
  categorySlug: null,
  categoryIcon: null,
  productTypeSlug: null,
  ...data,
})
const items = [
  item({
    id: "scale-untyped",
    title: "Scale without type",
    categoryId: "c1",
    productTypeId: null,
    categoryTitle: "Scales",
    categorySlug: "scales",
    categoryIcon: "scale",
  }),
  item({
    id: "industrial-scale",
    title: "Industrial scale",
    categoryId: "c1",
    productTypeId: "t1",
    categoryTitle: "Scales",
    categorySlug: "scales",
  }),
  item({
    id: "other-untyped",
    title: "Other untyped",
    categoryId: "c3",
    productTypeId: null,
    categoryTitle: "Other category",
    categorySlug: "other",
  }),
  item({
    id: "other-cross-type",
    title: "Misassigned scale",
    categoryId: "c3",
    productTypeId: "t1",
    categoryTitle: "Other category",
    categorySlug: "other",
  }),
  item({
    id: "no-slug-untyped",
    title: "No-slug untyped",
    categoryId: "c4",
    productTypeId: null,
    categoryTitle: "No-slug category",
  }),
]

const TestingAdapter = NuqsTestingAdapter as ComponentType<{
  searchParams: string
  children?: ReactNode
}>

function renderCatalog(searchParams: string) {
  return renderToStaticMarkup(
    createElement(
      TestingAdapter,
      { searchParams },
      createElement(ProductCatalogClients, {
        items,
        hierarchy,
        labels,
        navigationLabels,
        emptyCatalog: "Empty catalog",
        noMatches: "No matches",
        clearLabel: "Clear",
      })
    )
  )
}

describe("store category/type navigation", () => {
  it("keeps empty categories linked and renders their empty state", () => {
    const entry = renderCatalog("")
    expect(entry).toContain('aria-label="Search categories"')
    expect(entry).toContain('href="/productos?cat=empty"')
    expect(entry).toContain('data-directus-src="category-image"')
    expect(entry).toContain("material-symbols-rounded")
    expect(entry).not.toContain('href="/productos/')

    const emptyCategory = renderCatalog("?cat=empty")
    expect(emptyCategory).toContain(
      "This category has no types or products yet."
    )
    expect(emptyCategory).toContain('href="/productos"')
    expect(emptyCategory).not.toContain('href="/productos?cat=empty&type=')
  })

  it("keeps categories without slugs selectable through a stable ID URL", () => {
    const entry = renderCatalog("")
    expect(entry).toContain('href="/productos?cat=id%3Ac4"')

    const category = renderCatalog("?cat=id%3Ac4")
    expect(category).toContain("No-slug category")
    expect(category).toContain(
      'href="/productos?cat=id%3Ac4&amp;type=sin-tipo"'
    )

    const products = renderCatalog("?cat=id%3Ac4&type=sin-tipo")
    expect(products).toContain('href="/productos/no-slug-untyped"')
  })

  it("filters only category cards at the entry stage", () => {
    const html = renderCatalog("?q=Other")
    expect(html).toContain('value="Other"')
    expect(html).toContain('aria-label="Search categories"')
    expect(html).toContain('href="/productos?cat=other"')
    expect(html).not.toContain('href="/productos?cat=scales"')
    expect(html).not.toContain('href="/productos/')

    const noMatches = renderCatalog("?q=zzzz")
    expect(noMatches).toContain("No matches")
    expect(noMatches).toContain("Clear")
    expect(noMatches).not.toContain('href="/productos/')
  })

  it("renders the product type icon and keeps the category icon fallback", () => {
    const types = renderCatalog("?cat=scales")
    expect(types).toContain(">monitor_weight</span>")
    expect(types).toContain(">inventory_2</span>")

    const entry = renderCatalog("")
    expect(entry).not.toContain(">monitor_weight</span>")
    expect(entry).toContain(">category</span>")
  })

  it("does not show another category's types for the selected category", () => {
    const html = renderCatalog("?cat=scales")
    expect(html).toContain('href="/productos?cat=scales&amp;type=industrial"')
    expect(html).toContain('href="/productos?cat=scales&amp;type=sin-tipo"')
    expect(html).not.toContain("Bench")
    expect(html).toContain('href="/productos"')
  })

  it("treats a cross-category type URL as the category stage, not untyped products", () => {
    const html = renderCatalog("?cat=scales&type=bench")
    expect(html).toMatch(/data-slot="breadcrumb-page"[^>]*>Scales<\/span>/)
    expect(html).not.toMatch(
      /data-slot="breadcrumb-page"[^>]*>Untyped products<\/span>/
    )
    expect(html).toContain('href="/productos?cat=scales&amp;type=industrial"')
    expect(html).not.toContain('href="/productos/')
  })

  it("keeps selected products scoped even when another category reuses a type ID", () => {
    const html = renderCatalog("?cat=scales&type=industrial")
    expect(html).toContain('href="/productos/industrial-scale"')
    expect(html).not.toContain("other-cross-type")
    expect(html).not.toContain("other-untyped")
  })

  it("keeps untyped products scoped and provides a breadcrumb back to category", () => {
    const html = renderCatalog("?cat=scales&type=sin-tipo")
    expect(html).toContain('href="/productos?cat=scales"')
    expect(html).toContain("Untyped products")
    expect(html).toContain('href="/productos/scale-untyped"')
    expect(html).not.toContain("other-untyped")
  })

  it("uses DirectusImage when present and keeps a photo-shaped icon fallback when absent", () => {
    const data = item({
      id: "no-image",
      title: "No image",
      categoryId: "c1",
      productTypeId: null,
      categoryIcon: "scale",
    })
    const html = renderToStaticMarkup(createElement(ProductCard, { data }))
    expect(html).toContain("aspect-[4/3]")
    expect(html).toContain("scale")

    const withImage = renderToStaticMarkup(
      createElement(ProductCard, {
        data: { ...data, imageId: "product-image" },
      })
    )
    expect(withImage).toContain('data-directus-src="product-image"')
  })
})
