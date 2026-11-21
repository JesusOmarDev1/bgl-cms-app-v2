import { describe, expect, it } from "vitest"

import { money } from "@/lib/formatting/money"

import {
  serviceOrderAmounts,
  type ServiceOrderData,
} from "./service-order-helpers"
import {
  FIRST_PAGE_CAPACITY,
  PAGE_BUDGET,
  TEXT_BUDGET,
  serviceOrderPages,
  wrapServiceOrderText,
  type ServiceOrderPage,
} from "./service-order-pages"

// Synthetic fixture; these values are not read from Directus.
const base = {
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
        serial_number: "SER-000",
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

type Fixture = {
  scales?: number
  parts?: number | string[]
  description?: string
}

const order = ({
  scales = 1,
  parts = [],
  description = "Servicio preventivo de ejemplo.",
}: Fixture = {}): ServiceOrderData => {
  const titles =
    typeof parts === "number"
      ? Array.from({ length: parts }, (_, index) => `Refacción ${index}`)
      : parts
  return {
    ...base,
    description,
    scales: Array.from({ length: scales }, (_, index) => ({
      scales_id: {
        ...base.scales[0].scales_id,
        id: `scale-${index}`,
        serial_number: `SER-${index}`,
      },
    })),
    parts: titles.map((title) => ({
      quantity: 1,
      inventory_id: { title, price: "1.00" },
    })),
  } satisfies ServiceOrderData
}

const pagesOf = (fixture: Fixture, showPrices = true): ServiceOrderPage[] => {
  const data = order(fixture)
  return serviceOrderPages(data, serviceOrderAmounts(data), showPrices)
}

// 792 − 18 padding − 86 header − 30 logos − 76 footer leaves this much body.
const BODY =
  PAGE_BUDGET.height -
  PAGE_BUDGET.padding -
  PAGE_BUDGET.header -
  PAGE_BUDGET.logos -
  PAGE_BUDGET.footer

const serials = (pages: ServiceOrderPage[]) =>
  pages.flatMap((page) => page.equipment.map((box) => box.serial))
const partTitles = (pages: ServiceOrderPage[]) =>
  pages.flatMap((page) => page.parts.map((line) => line.description))
const words = (text: string) => text.split(/\s+/).filter(Boolean)

describe("wrapServiceOrderText", () => {
  it("keeps explicit line breaks and never exceeds the character budget", () => {
    const lines = wrapServiceOrderText(
      "Primera línea corta\n\nSegunda línea con más palabras que el presupuesto",
      20
    )
    expect(lines).toEqual([
      "Primera línea corta",
      "",
      "Segunda línea con",
      "más palabras que el",
      "presupuesto",
    ])
    expect(lines.every((line) => line.length <= 20)).toBe(true)
  })

  it("drops no character when a single word is longer than a line", () => {
    const word = "A".repeat(45)
    const lines = wrapServiceOrderText(word, 20)
    expect(lines.join("")).toBe(word)
    expect(lines.every((line) => line.length <= 20)).toBe(true)
  })

  it("returns no lines for an empty description", () => {
    expect(wrapServiceOrderText("", 20)).toEqual([])
  })
})

describe("serviceOrderPages", () => {
  it("declares the measured first-page capacity", () => {
    expect(FIRST_PAGE_CAPACITY).toEqual({
      descriptionLines: 8,
      equipmentRows: 1,
      equipment: 2,
      partsRows: 4,
    })
  })

  it("pins the measured text budgets", () => {
    expect(TEXT_BUDGET).toEqual({
      description: { charsPerLine: 100 },
      equipment: { charsPerLine: 7, linesPerBox: 3 },
      parts: { charsPerLine: 40, linesPerRow: 2 },
    })
    // Continuation pages pack the measured block costs, not row counts.
    expect(PAGE_BUDGET).toMatchObject({
      height: 792,
      header: 86,
      signatures: 111,
      logos: 30,
      footer: 76,
      equipmentRow: 62,
      equipmentGap: 6,
      partsRow: 21,
    })
  })

  it("keeps two equipment boxes and four part rows on one letter page", () => {
    const pages = pagesOf({ scales: 2, parts: 4 })
    expect(pages).toHaveLength(1)
    expect(pages[0].equipment).toHaveLength(2)
    expect(pages[0].parts).toHaveLength(4)
    expect(pages[0].height).toBe(PAGE_BUDGET.height)
  })

  it("moves the first item over the maximum to a continuation page", () => {
    const parts = pagesOf({ scales: 2, parts: 5 })
    expect(parts).toHaveLength(2)
    expect(parts[0].parts.map((line) => line.description)).toEqual([
      "Refacción 0",
      "Refacción 1",
      "Refacción 2",
      "Refacción 3",
    ])
    expect(parts[1].parts.map((line) => line.description)).toEqual([
      "Refacción 4",
    ])

    const equipment = pagesOf({ scales: 3, parts: 4 })
    expect(equipment).toHaveLength(2)
    expect(serials(equipment)).toEqual(["SER-0", "SER-1", "SER-2"])
    expect(equipment[1].equipment.map((box) => box.serial)).toEqual(["SER-2"])
  })

  it("keeps order and every item across nine equipment and fourteen parts", () => {
    const pages = pagesOf({ scales: 9, parts: 14 })
    expect(pages.length).toBeGreaterThan(1)
    expect(serials(pages)).toEqual(
      Array.from({ length: 9 }, (_, index) => `SER-${index}`)
    )
    expect(partTitles(pages)).toEqual(
      Array.from({ length: 14 }, (_, index) => `Refacción ${index}`)
    )
    // No page repeats an item and no continuation page splits a data row.
    expect(new Set(partTitles(pages)).size).toBe(14)
    expect(pages[0].parts).toHaveLength(4)
  })

  it("keeps every continuation page inside the measured body height", () => {
    const pages = pagesOf({ scales: 9, parts: 14 })
    const last = pages.length - 1
    pages.forEach((page, index) => {
      if (index === 0) {
        expect(page.height).toBe(PAGE_BUDGET.height)
        return
      }
      const limit = index === last ? BODY - PAGE_BUDGET.signatures : BODY
      expect(page.height).toBeLessThanOrEqual(limit)
    })
  })

  it("splits a long description at line boundaries without losing words", () => {
    const description = Array.from(
      { length: 40 },
      () => "Diagnóstico completo del equipo con mediciones repetidas."
    ).join(" ")
    const pages = pagesOf({ scales: 2, parts: 4, description })
    expect(pages.length).toBeGreaterThan(1)
    expect(pages[0].description).toHaveLength(
      FIRST_PAGE_CAPACITY.descriptionLines
    )
    for (const page of pages)
      for (const line of page.description)
        expect(line.length).toBeLessThanOrEqual(
          TEXT_BUDGET.description.charsPerLine
        )
    expect(words(pages.flatMap((page) => page.description).join(" "))).toEqual(
      words(description)
    )
  })

  it("charges extra lines to long part descriptions instead of clipping", () => {
    const short = pagesOf({ scales: 2, parts: 40 })
    const long = pagesOf({
      scales: 2,
      parts: Array.from(
        { length: 40 },
        (_, index) =>
          `Refacción ${index} con una descripción considerablemente larga que ocupa varias líneas dentro de la tabla de refacciones`
      ),
    })
    expect(long.length).toBeGreaterThan(short.length)
    expect(partTitles(long)).toHaveLength(40)
    const last = long.length - 1
    long.forEach((page, index) => {
      if (index === 0) return
      expect(page.height).toBeLessThanOrEqual(
        index === last ? BODY - PAGE_BUDGET.signatures : BODY
      )
    })
  })

  it("gives an over-long single value a whole page instead of cutting it", () => {
    const title = `Refacción ${"descripción ".repeat(28)}final`
    const pages = pagesOf({ scales: 1, parts: [title] })
    expect(pages[0].parts[0].description).toBe(title)
    expect(pages[0].height).toBe(PAGE_BUDGET.height)
  })

  it("keeps hidden prices empty on every page", () => {
    const pages = pagesOf({ scales: 9, parts: 14 }, false)
    for (const page of pages)
      for (const line of page.parts) {
        expect(line.unitPrice).toBe("")
        expect(line.amount).toBe("")
      }
    expect(pagesOf({ scales: 9, parts: 14 }, true)[0].parts[0].amount).toBe(
      money(100)
    )
  })
})
