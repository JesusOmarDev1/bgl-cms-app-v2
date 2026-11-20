import { readFileSync } from "node:fs"

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { money } from "@/lib/formatting/money"

import {
  assertScalesBelongToClient,
  serviceOrderAmounts,
  type ServiceOrderData,
} from "./service-order-helpers"
import { ServiceOrderView } from "./service-order-view"

// Extracted stylesheets are asserted from source: they never reach the markup.
// Whitespace is flattened so the assertions ignore formatting.
const readCss = (path: URL) => readFileSync(path, "utf8").replace(/\s+/g, " ")
const sheetCss = () => readCss(new URL("./service-order.css", import.meta.url))
const printCss = () => readCss(new URL("../../app/print.css", import.meta.url))

// Synthetic fixture; these values are not read from Directus.
const sampleOrder = {
  folio: "123e4567-e89b-42d3-a456-426614174000",
  date_created: "2026-11-07T12:00:00.000Z",
  client: {
    id: "123e4567-e89b-42d3-a456-426614174001",
    name: "Cliente de ejemplo",
    address: "Calle de ejemplo 123",
    contact: "Contacto de ejemplo",
    city: "Zapopan",
    state: "Jalisco",
  },
  description: "Servicio preventivo de ejemplo.",
  technician_name: { first_name: "Técnico", last_name: "Ejemplo" },
  technician_signature: { id: "123e4567-e89b-42d3-a456-426614174003" },
  client_signature: { id: "123e4567-e89b-42d3-a456-426614174004" },
  status: "draft",
  client_name: "Receptor de ejemplo",
  client_department: "Mantenimiento",
  scales: [
    {
      scales_id: {
        id: "123e4567-e89b-42d3-a456-426614174002",
        client: { id: "123e4567-e89b-42d3-a456-426614174001" },
        brand: { title: "Marca de ejemplo" },
        model: { title: "Modelo de ejemplo" },
        serial_number: "SER-001",
        capacity: 50,
        units: "kg",
      },
    },
  ],
  parts: [
    {
      quantity: 2,
      inventory_id: { title: "Refacción de ejemplo", price: "15.50" },
    },
  ],
  labor_cost: "100.00",
  overtime_cost: null,
  travel_cost: null,
  other_cost: null,
  apply_vat: true,
} satisfies ServiceOrderData

describe("serviceOrderAmounts", () => {
  it("keeps the existing monetary calculation", () => {
    const amounts = serviceOrderAmounts(sampleOrder)
    expect(amounts.parts).toBe(3100)
    expect(amounts.subtotal).toBe(13100)
    expect(amounts.vat).toBe(2096)
    expect(amounts.total).toBe(15196)
  })

  it("rounds the vat and drops totals it cannot compute", () => {
    expect(
      serviceOrderAmounts({ ...sampleOrder, parts: [], labor_cost: "0.04" }).vat
    ).toBe(1)
    expect(
      serviceOrderAmounts({
        ...sampleOrder,
        parts: [
          { quantity: 2, inventory_id: { title: "Sin precio", price: null } },
        ],
      }).total
    ).toBeNull()
    expect(
      serviceOrderAmounts({ ...sampleOrder, parts: [], labor_cost: null }).total
    ).toBeNull()
  })
})

describe("assertScalesBelongToClient", () => {
  it("rejects equipment from another client", () => {
    const foreign = {
      ...sampleOrder,
      scales: [
        {
          scales_id: {
            ...sampleOrder.scales[0].scales_id,
            client: { id: "123e4567-e89b-42d3-a456-426614174099" },
          },
        },
      ],
    } satisfies ServiceOrderData
    expect(() => assertScalesBelongToClient(foreign)).toThrow(
      "Service order scales must belong to the selected client"
    )
    expect(() =>
      renderToStaticMarkup(<ServiceOrderView variant="filled" data={foreign} />)
    ).toThrow("Service order scales must belong to the selected client")
    expect(() => assertScalesBelongToClient(sampleOrder)).not.toThrow()
  })

  it("rejects a service order without equipment", () => {
    expect(() =>
      assertScalesBelongToClient({ ...sampleOrder, scales: [] })
    ).toThrow("Service order scales must belong to the selected client")
  })
})

describe("ServiceOrderView", () => {
  it("renders a semantic document with every line of the order", () => {
    const html = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={sampleOrder} />
    )
    expect(html.match(/<article class="([^"]+)"/)?.[1].split(" ")).toEqual([
      "so-page-sheet",
      "so-page-sheet-filled",
    ])
    expect(html).toContain("<h1")
    expect(html).toContain("ORDEN DE SERVICIO")
    expect(html).toContain("REPORTE DE SERVICIO")
    expect(html).toContain("SERVICIO REALIZADO")
    expect(html).toContain("EQUIPO REVISADO")
    expect(html).toContain("<caption")
    expect(html).toContain("REFACCIONES")
    expect(html).toContain('<th scope="col">CANTIDAD</th>')
    expect(html).toContain("Refacción de ejemplo")
    expect(html).toContain("Marca de ejemplo")
    expect(html).toContain("SER-001")
    expect(html).toContain("REALIZÓ EL TRABAJO")
    expect(html).toContain("RECIBÍ EL TRABAJO A SATISFACCIÓN")
    expect(html).toContain("TOTAL DE PARTES")
    expect(html).toContain("IVA")
    expect(html).toContain("Firma no disponible")
    expect(html).toContain('src="/static/logo-dark.png"')
    expect(html).toContain('alt="Rice Lake"')
  })

  it("matches the printed form's minimum rows and two-column client layout", () => {
    const filled = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={sampleOrder} />
    )
    expect(filled.match(/class="so-equipment-item-box"/g)).toHaveLength(2)
    expect(
      filled.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr/g)
    ).toHaveLength(4)
    expect(filled).toContain("CONTACTO")
    expect(filled).toContain("CIUDAD")
    expect(filled).toContain("ESTADO")
    expect(filled).toContain('style="width:70pt"')
    expect(filled).toContain("so-signature-mark")
  })

  it("styles US Letter from an extracted format stylesheet instead of inline CSS", () => {
    const filled = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={sampleOrder} />
    )
    expect(filled).not.toContain("<style")
    expect(filled).not.toContain(".so-page-sheet")

    const css = sheetCss()
    expect(css).toContain("@page { size: 612pt 792pt; margin: 0; }")
    expect(css).toContain("width: 612pt;")
    expect(css).toContain("min-height: 792pt;")
    expect(css).toContain("max-width: 816px;")
    expect(css).toContain("min-height: 1056px;")
    expect(css).toContain("padding: 18pt 24pt 0;")
    expect(css).toContain("left: 124pt; width: 440pt;")
    expect(css).toContain(".so-signature-group { flex: 0 0 380pt;")
    expect(css).toContain(".so-totals-list { flex: 0 0 174pt; }")
    expect(css).toContain("#d3393b")
  })

  it("recovers the 12pt of page height from flexible blocks only", () => {
    const css = sheetCss()
    // 18pt padding + 86 header + 92 fields + 143 description + 108 equipment +
    // 128 parts + 111 signatures + 30 logos + 76 footer = 792pt.
    expect(css).toContain(
      ".so-sheet-section:has(.so-fields-grid) { min-height: 92pt; }"
    )
    expect(css).toContain(
      ".so-sheet-section:has(.so-description-block) { min-height: 143pt;"
    )
    expect(css).toContain(
      ".so-sheet-section:has(.so-equipment-list) { min-height: 108pt; }"
    )
    expect(css).toContain(
      ".so-sheet-section:has(.so-parts-table) { min-height: 128pt; }"
    )
    expect(css).toContain(".so-signatures-totals-row { min-height: 111pt;")
    expect(css).toContain(".so-footer-block { height: 76pt;")
    // Content heights that must not shrink with the page.
    expect(css).toContain(
      ".so-header-block { height: 86pt; position: relative; }"
    )
    expect(css).toContain(".so-equipment-list dd { min-height: 51pt; }")
    expect(css).toContain(".so-signature-box { flex: 1; min-height: 42pt;")
  })

  it("separates multipage sheets and keeps continuation blocks content-sized", () => {
    const css = sheetCss()
    // One printed page per explicit sheet; no trailing blank page.
    expect(css).toContain(
      ".so-multipage-stack .so-page-sheet + .so-page-sheet { break-before: page; }"
    )
    expect(css).toContain(".so-multipage-stack { align-items: center;")
    // Continuation sheets carry only the content they measured for.
    expect(css).toContain(
      ".so-multipage-stack .so-page-sheet + .so-page-sheet .so-sheet-section:has(.so-description-block), "
    )
    expect(css).toContain(
      ".so-multipage-stack .so-page-sheet + .so-page-sheet .so-sheet-section:has(.so-parts-table) { min-height: 0; }"
    )
    // Over-long values wrap inside their box instead of leaving the sheet.
    expect(css).toContain("overflow-wrap: break-word;")
  })

  it("keeps reusable print primitives in app/print.css", () => {
    const print = printCss()
    expect(print).toContain(":root, body { background: #fff !important;")
    expect(print).toContain("print-color-adjust: exact;")
    // Format styles stay in the component stylesheet.
    expect(print).not.toMatch(/\.so-/)
    expect(print).not.toContain("@page")
  })

  it("renders equipment data in the second half of the sheet", () => {
    const twoScales = {
      ...sampleOrder,
      scales: [
        ...sampleOrder.scales,
        {
          scales_id: {
            ...sampleOrder.scales[0].scales_id,
            id: "123e4567-e89b-42d3-a456-426614174005",
            serial_number: "SER-SECOND",
          },
        },
      ],
    } satisfies ServiceOrderData
    const html = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={twoScales} />
    )
    expect(html).toContain("SER-SECOND")
    expect(html.match(/class="so-equipment-item-box"/g)).toHaveLength(2)
  })

  it("hides every price when showPrices is off", () => {
    const amounts = serviceOrderAmounts(sampleOrder)
    const shown = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={sampleOrder} showPrices />
    )
    expect(shown).toContain(money(amounts.lines[0].price))
    expect(shown).toContain(money(amounts.lines[0].amount))
    expect(shown).toContain(money(amounts.total))

    const hidden = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={sampleOrder} />
    )
    expect(hidden).not.toContain(money(amounts.lines[0].price))
    expect(hidden).not.toContain(money(amounts.lines[0].amount))
    expect(hidden).not.toContain(money(amounts.total))
  })

  it("keeps the blank variant as an empty form", () => {
    const html = renderToStaticMarkup(<ServiceOrderView variant="blank" />)
    expect(html.match(/<article class="([^"]+)"/)?.[1].split(" ")).toEqual([
      "so-page-sheet",
    ])
    expect(html).toContain("ORDEN DE SERVICIO")
    expect(html).toContain("EQUIPO REVISADO")
    expect(html).toContain("REFACCIONES")
    expect(html).not.toContain("Cliente de ejemplo")
    // Header row plus four empty line rows.
    expect(html.match(/<tr/g)?.length).toBe(5)
    expect(html.match(/class="so-equipment-item-box"/g)).toHaveLength(2)
  })

  it("renders long orders in natural flow for multi-page printing", () => {
    const longOrder = {
      ...sampleOrder,
      scales: Array.from({ length: 9 }, (_, index) => ({
        scales_id: {
          ...sampleOrder.scales[0].scales_id,
          id: `scale-${index}`,
          serial_number: `SER-${index}`,
        },
      })),
      parts: Array.from({ length: 14 }, (_, index) => ({
        quantity: 1,
        inventory_id: { title: `Refacción ${index}`, price: "1.00" },
      })),
    } satisfies ServiceOrderData
    const html = renderToStaticMarkup(
      <ServiceOrderView variant="filled" data={longOrder} showPrices />
    )
    for (const index of [0, 8]) expect(html).toContain(`SER-${index}`)
    for (const index of [0, 13]) expect(html).toContain(`Refacción ${index}`)
    // Header row plus fourteen line rows.
    expect(html.match(/<tr/g)?.length).toBe(15)
  })

  it("renders the multipage variant as one explicit sheet per letter page", () => {
    const data = {
      ...sampleOrder,
      parts: Array.from({ length: 5 }, (_, index) => ({
        quantity: 1,
        inventory_id: { title: `Refacción ${index}`, price: "1.00" },
      })),
    } satisfies ServiceOrderData
    const html = renderToStaticMarkup(
      <ServiceOrderView variant="multipage" data={data} />
    )
    expect(
      html.match(/class="so-page-sheet so-page-sheet-filled"/g)
    ).toHaveLength(2)
    // Continuation rules: folio/header, partner logos and footer on every page.
    expect(html.match(/class="so-header-folio"/g)).toHaveLength(2)
    expect(html.match(/class="so-footer-block"/g)).toHaveLength(2)
    expect(html.match(/alt="Rice Lake"/g)).toHaveLength(2)
    // One repeated table header per page that has part rows.
    expect(html.match(/<th scope="col">CANTIDAD<\/th>/g)).toHaveLength(2)
    // Signatures and totals only on the last page, after the first footer.
    for (const label of ["REALIZÓ EL TRABAJO", "TOTAL DE PARTES"])
      expect(html.match(new RegExp(label, "g"))).toHaveLength(1)
    expect(html.indexOf("REALIZÓ EL TRABAJO")).toBeGreaterThan(
      html.indexOf("so-footer-block")
    )
    expect(html.indexOf("REALIZÓ EL TRABAJO")).toBeLessThan(
      html.lastIndexOf("so-footer-block")
    )
    // Client fields belong to the first page only, rows stay whole.
    expect(html.match(/REPORTE DE SERVICIO/g)).toHaveLength(1)
    expect(html.match(/<tbody>[\s\S]*?<\/tbody>/g)).toHaveLength(2)
    expect(html.match(/<tr/g)?.length).toBe(7)
  })

  it("keeps a multipage order inside one sheet while it measures up", () => {
    const data = {
      ...sampleOrder,
      scales: [sampleOrder.scales[0], sampleOrder.scales[0]],
      parts: Array.from({ length: 4 }, (_, index) => ({
        quantity: 1,
        inventory_id: { title: `Refacción ${index}`, price: "1.00" },
      })),
    } satisfies ServiceOrderData
    const html = renderToStaticMarkup(
      <ServiceOrderView variant="multipage" data={data} />
    )
    expect(html.match(/<article /g)).toHaveLength(1)
    expect(html.match(/class="so-equipment-item-box"/g)).toHaveLength(2)
    expect(html.match(/<tr/g)?.length).toBe(5)
  })

  it("keeps every description line of a multipage order", () => {
    const description = Array.from(
      { length: 40 },
      () => "Diagnóstico completo del equipo con mediciones repetidas."
    ).join(" ")
    const html = renderToStaticMarkup(
      <ServiceOrderView
        variant="multipage"
        data={{ ...sampleOrder, description }}
      />
    )
    const text = html.replace(/<[^>]+>/g, " ")
    for (const word of ["Diagnóstico", "mediciones", "repetidas."])
      expect(text).toContain(word)
    expect(text.split(/\s+/).filter(Boolean)).toEqual(
      expect.arrayContaining(description.split(" "))
    )
  })

  it("requires the order payload for the multipage variant", () => {
    // @ts-expect-error multipage documents paginate an order, so data is required.
    const missing = <ServiceOrderView variant="multipage" />
    expect(missing).toBeDefined()
  })
})
