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
// Resolves the real Spanish copy so the assertions pin the shipped strings.
vi.mock("next-intl", async () => {
  const messages: Record<string, Record<string, string>> = {
    catalog: (await import("@/i18n/messages/es/catalog.json")).default.catalog,
    products: (await import("@/i18n/messages/es/products.json")).default
      .products as unknown as Record<string, string>,
  }
  function format(message: string, values: Record<string, unknown>) {
    return message
      .replace(
        /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g,
        (_match, key: string, one: string, other: string) =>
          (String(values[key]) === "1" ? one : other).replace(
            "#",
            String(values[key])
          )
      )
      .replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ""))
  }
  return {
    useTranslations:
      (namespace: string) =>
      (key: string, values: Record<string, unknown> = {}) => {
        const message = messages[namespace]?.[key]
        return typeof message === "string" ? format(message, values) : key
      },
  }
})
vi.mock("@/components/shared/assets/img/DirectusImage", async () => {
  const { createElement } = await import("react")
  return {
    DirectusImage: ({ alt, src }: { alt: string; src: string }) =>
      createElement("img", { alt, "data-directus-src": src }),
  }
})

const labels: CatalogLabels = {
  category: {
    label: "Categoría",
    placeholder: "Buscar por categoría...",
    all: "Todas las categorías",
  },
  search: {
    label: "Buscar productos",
    placeholder: "Buscar por nombre o descripción...",
  },
  sort: {
    label: "Ordenar",
    newest: "Más recientes",
    oldest: "Más antiguos",
    az: "A-Z",
    za: "Z-A",
  },
  filters: {
    brand: "Marca",
    capacity: "Capacidad",
    division: "División",
    all: "Todos",
  },
  clear: "Limpiar filtros",
}
const navigationLabels = {
  categories: "Todas las categorías",
  untypedProducts: "Productos sin tipo",
  emptyCategory: "Esta categoría todavía no tiene tipos ni productos.",
  searchLabel: "Buscar categorías",
  searchPlaceholder: "Buscar categorías...",
}
const hierarchy: CatalogHierarchy[] = [
  {
    id: "c1",
    slug: "comercial",
    title: "Comercial",
    imageId: null,
    types: [
      {
        id: "t1",
        slug: "basculas",
        title: "Básculas",
        icon: "scale",
        imageId: null,
      },
    ],
    untypedProductCount: 1,
  },
]
const item = (
  data: Partial<ProductCardData> & Pick<ProductCardData, "id" | "title">
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
  categoryTitle: "Comercial",
  categorySlug: "comercial",
  categoryIcon: "scale",
  categoryId: "c1",
  productTypeId: "t1",
  productTypeSlug: "basculas",
  ...data,
})
const items: ProductCardData[] = [
  item({
    id: "bpp-40",
    title: "Báscula peso-precio BPP-40RS",
    brand: "Torrey",
    capacity: 40,
    division: 5,
  }),
  item({
    id: "ind-30",
    title: "Indicador de peso IND-30",
    brand: "Metrology",
    capacity: 30,
    division: 10,
  }),
  item({
    id: "untyped-scale",
    title: "Báscula sin tipo",
    productTypeId: null,
    productTypeSlug: null,
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
        emptyCatalog: "Todavía no hay productos publicados.",
        noMatches: "Ningún producto coincide con la búsqueda.",
        clearLabel: "Limpiar filtros",
      })
    )
  )
}

describe("faceted product results", () => {
  it("shows the count of products left after filtering", () => {
    const all = renderCatalog("?cat=comercial&type=basculas")
    expect(all).toContain("2</strong> productos en Básculas · Comercial")

    const filtered = renderCatalog("?cat=comercial&type=basculas&brand=Torrey")
    expect(filtered).toContain("1</strong> producto en Básculas · Comercial")
    expect(filtered).not.toContain("IND-30")

    const searched = renderCatalog("?cat=comercial&type=basculas&q=indicador")
    expect(searched).toContain("1</strong> producto en Básculas · Comercial")

    const untyped = renderCatalog("?cat=comercial&type=sin-tipo")
    expect(untyped).toContain(
      "1</strong> producto en Productos sin tipo · Comercial"
    )
  })

  it("renders one removable chip per active filter and a clear-all action", () => {
    const html = renderCatalog(
      "?cat=comercial&type=basculas&brand=Torrey&capacity=40&division=5&q=acero"
    )
    expect(html).toContain('aria-label="Filtros activos"')
    expect(html).toContain('aria-label="Quitar filtro Marca"')
    expect(html).toContain('aria-label="Quitar filtro Capacidad"')
    expect(html).toContain('aria-label="Quitar filtro División"')
    expect(html).toContain('aria-label="Quitar filtro Búsqueda"')
    expect(html).toContain("Torrey")
    expect(html).toContain("acero")
    expect(html).toContain("Limpiar todo")

    const single = renderCatalog("?cat=comercial&type=basculas&brand=Torrey")
    expect(single).toContain('aria-label="Quitar filtro Marca"')
    expect(single).not.toContain('aria-label="Quitar filtro Capacidad"')
  })

  it("keeps chips and stale filter params consistent", () => {
    const clear = renderCatalog("?cat=comercial&type=basculas")
    expect(clear).not.toContain("Filtros activos")
    expect(clear).not.toContain("Limpiar todo")

    const stale = renderCatalog("?cat=comercial&type=basculas&brand=Nope")
    expect(stale).not.toContain('aria-label="Quitar filtro Marca"')
    expect(stale).not.toContain("Filtros activos")
  })

  it("labels the sort trigger with the current sort value", () => {
    const newest = renderCatalog("?cat=comercial&type=basculas")
    expect(newest).toContain("Ordenar:")
    expect(newest).toContain("Más recientes")

    const az = renderCatalog("?cat=comercial&type=basculas&sort=a-z")
    expect(az).toContain("Ordenar:")
    expect(az).toContain("A-Z")
  })

  it("shows brand, capacity and division facets on each product card", () => {
    const html = renderToStaticMarkup(
      createElement(ProductCard, { data: items[0] })
    )
    expect(html).toContain("Marca: Torrey")
    expect(html).toContain("Capacidad 40 kg · División 5 g")

    const bare = renderToStaticMarkup(
      createElement(ProductCard, { data: items[2] })
    )
    expect(bare).not.toContain("Capacidad")
    expect(bare).not.toContain("Marca:")
  })
})
