import { createElement, type ComponentType, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { describe, expect, it, vi } from "vitest"
import { ProductCatalogClients } from "@/components/collections/products/ProductCatalogClients"
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
    placeholder: "Buscar categoría",
    all: "Todas",
  },
  search: { label: "Buscar", placeholder: "Buscar" },
  sort: {
    label: "Ordenar",
    newest: "Más recientes",
    oldest: "Más antiguos",
    az: "A-Z",
    za: "Z-A",
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
    icon: "scale",
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
    productCount: 3,
    untypedProductCount: 1,
  },
  {
    id: "c2",
    slug: "indicadores",
    title: "Indicadores",
    icon: "monitor_weight",
    imageId: "category-image",
    types: [
      {
        id: "t2",
        slug: "indicadores-de-peso",
        title: "Indicadores de peso",
        icon: "monitor_weight",
        imageId: null,
      },
    ],
    productCount: 1,
    untypedProductCount: 0,
  },
  {
    id: "c3",
    slug: "laboratorio",
    title: "Laboratorio",
    icon: null,
    imageId: null,
    types: [],
    productCount: 0,
    untypedProductCount: 0,
  },
]
const items: ProductCardData[] = []

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
        emptyCatalog: "Sin productos",
        noMatches: "Sin resultados",
        clearLabel: "Limpiar filtros",
      })
    )
  )
}

describe("store navigation depth", () => {
  it("shows a product-count badge with ICU plural on each category card", () => {
    const html = renderCatalog("")
    expect(html).toContain(">3 productos<")
    expect(html).toContain(">1 producto<")
    expect(html).not.toContain(">1 productos<")
    expect(html).toContain(">Sin productos aún<")
  })

  it("groups populated categories apart from still-empty ones", () => {
    const html = renderCatalog("")
    expect(html).toContain("Categorías con productos")
    expect(html).toContain("Más categorías")
    expect(html.indexOf("Comercial")).toBeLessThan(
      html.indexOf("Más categorías")
    )
    expect(html.indexOf("Más categorías")).toBeLessThan(
      html.indexOf("Laboratorio")
    )
  })

  it("previews each populated category's type names as chips", () => {
    const html = renderCatalog("")
    const chips = html.match(/data-slot="type-chips"/g) ?? []
    expect(chips).toHaveLength(2)
    expect(html).toContain("Básculas")
    expect(html).toContain("Indicadores de peso")
  })

  it("keeps empty categories linked and labeled instead of hiding them", () => {
    const html = renderCatalog("")
    expect(html).toContain('href="/tienda?cat=laboratorio"')
    const labTile = html.slice(html.indexOf('href="/tienda?cat=laboratorio"'))
    expect(labTile).toContain("Sin productos aún")
    expect(labTile).not.toContain('data-slot="type-chips"')
  })

  it("leans on category icons and images for the tiles", () => {
    const html = renderCatalog("")
    expect(html).toContain(">scale</span>")
    expect(html).toContain('data-directus-src="category-image"')
    expect(html).toContain(">category</span>")
  })

  it("hides the empty group when every matching category has products", () => {
    const html = renderCatalog("?q=Comercial")
    expect(html).toContain("Categorías con productos")
    expect(html).not.toContain("Más categorías")
  })
})
