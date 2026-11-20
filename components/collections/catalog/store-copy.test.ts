import { describe, expect, it } from "vitest"
import products from "@/i18n/messages/es/products.json"

describe("store page copy", () => {
  it("describes browsing the catalog by category, type, and product", () => {
    expect(products.products.title).toBe("Catálogo")
    expect(products.products.intro).toMatch(/categoría/i)
    expect(products.products.intro).toMatch(/tipo/i)
  })
})
