import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CatalogToolBarSkeleton } from "@/components/collections/catalog/CatalogToolBarSkeleton"
import { ProductCatalogSkeleton } from "@/components/collections/products/ProductCatalogSkeleton"

function render(stage: "categories" | "types" | "products") {
  return renderToStaticMarkup(createElement(ProductCatalogSkeleton, { stage }))
}

describe("ProductCatalogSkeleton", () => {
  it("renders photo-led navigation without a toolbar, then product controls and cards", () => {
    const categories = render("categories")
    const types = render("types")
    const products = render("products")

    expect(categories).toContain("aspect-[16/10]")
    expect(categories).not.toContain("h-8")
    expect(types).toContain("aspect-[16/10]")
    expect(types).not.toContain("h-8")
    expect(products).toContain("h-8")
    expect(products).toContain("aspect-[4/3]")
    expect(products).not.toContain("lg:w-64")
    expect(products).toContain('aria-hidden="true"')
  })

  it("keeps the default toolbar skeleton used by shared catalog consumers", () => {
    const toolbar = renderToStaticMarkup(createElement(CatalogToolBarSkeleton))
    expect((toolbar.match(/data-slot="skeleton"/g) ?? []).length).toBe(3)
    expect(toolbar).toContain("lg:w-64")
  })
})
