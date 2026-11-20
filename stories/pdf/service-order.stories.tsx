import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import {
  assertScalesBelongToClient,
  serviceOrderAmounts,
  type ServiceOrderData,
} from "@/components/service-order/service-order-helpers"
import { ServiceOrderView } from "@/components/service-order/service-order-view"
import { money } from "@/lib/formatting/money"

// Synthetic Storybook fixture; these values are not read from Directus.
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

// Synthetic acceptance fixtures; these values are not read from Directus.
const orderWith = ({
  scales,
  parts,
  description = sampleOrder.description,
}: {
  scales: number
  parts: number
  description?: string
}): ServiceOrderData => ({
  ...sampleOrder,
  description,
  scales: Array.from({ length: scales }, (_, index) => ({
    scales_id: {
      ...sampleOrder.scales[0].scales_id,
      id: `123e4567-e89b-42d3-a456-42661417410${index}`,
      serial_number: `SER-10${index}`,
    },
  })),
  parts: Array.from({ length: parts }, (_, index) => ({
    quantity: 1,
    inventory_id: { title: `Refacción de ejemplo ${index + 1}`, price: "1.00" },
  })),
})

// Two equipment boxes and four part rows are the first page's measured capacity.
const fullOrder = orderWith({ scales: 2, parts: 4 })
// One item over each maximum spills onto a continuation page.
const overCapacityOrder = orderWith({ scales: 3, parts: 5 })
const longOrder = orderWith({ scales: 9, parts: 14 })
const longDescriptionOrder = orderWith({
  scales: 2,
  parts: 4,
  description: Array.from(
    { length: 40 },
    () => "Diagnóstico completo del equipo con mediciones repetidas."
  ).join(" "),
})
// Fills continuation pages to their measured maxima: 8 equipment rows on one
// page, 25 one-line part rows on the next.
const denseOrder = orderWith({ scales: 18, parts: 34 })

const meta = {
  title: "Orden de servicio",
  component: ServiceOrderView,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ServiceOrderView>

export default meta
type Story = StoryObj<typeof meta>

export const Filled: Story = {
  args: { variant: "filled", data: sampleOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    const amounts = serviceOrderAmounts(sampleOrder)
    await expect(amounts.parts).toBe(3100)
    await expect(amounts.subtotal).toBe(13100)
    await expect(amounts.vat).toBe(2096)
    await expect(amounts.total).toBe(15196)
    await expect(() =>
      assertScalesBelongToClient({
        ...sampleOrder,
        scales: [
          {
            scales_id: {
              ...sampleOrder.scales[0].scales_id,
              client: { id: "123e4567-e89b-42d3-a456-426614174099" },
            },
          },
        ],
      })
    ).toThrow("Service order scales must belong to the selected client")

    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("heading", { level: 1, name: "ORDEN DE SERVICIO" })
    ).toBeTruthy()
    await expect(
      canvas.getByRole("heading", { name: "EQUIPO REVISADO" })
    ).toBeTruthy()
    await expect(canvas.getByText("SER-001")).toBeTruthy()
    const table = canvas.getByRole("table")
    await expect(within(table).getAllByRole("row")).toHaveLength(5)
    await expect(
      canvasElement.querySelectorAll(".so-equipment-item-box")
    ).toHaveLength(2)
    await expect(
      within(table).getByText(money(amounts.lines[0].price))
    ).toBeTruthy()
    await expect(canvas.getByText(money(amounts.total))).toBeTruthy()
    await expect(
      canvasElement.querySelector("embed, iframe, object")
    ).toBeNull()
    // Logo and partner-logo URLs must load in the browser, not only in the PDF context.
    const images = Array.from(canvasElement.querySelectorAll("img"))
    await expect(images.length).toBeGreaterThanOrEqual(9)
    const allLoaded = async () => {
      for (let attempt = 0; attempt < 50; attempt++) {
        if (images.every((image) => image.complete && image.naturalWidth))
          return true
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return false
    }
    await expect(await allLoaded()).toBe(true)
  },
}

export const BlankForm: Story = {
  args: { variant: "blank" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("heading", { level: 1, name: "ORDEN DE SERVICIO" })
    ).toBeTruthy()
    await expect(canvas.getByText("REFACCIONES")).toBeTruthy()
    // Header row plus the four empty line rows.
    await expect(canvas.getAllByRole("row")).toHaveLength(5)
    await expect(
      canvasElement.querySelector("embed, iframe, object")
    ).toBeNull()
  },
}

export const PricesHidden: Story = {
  args: { variant: "filled", data: sampleOrder, showPrices: false },
  play: async ({ canvasElement }) => {
    const amounts = serviceOrderAmounts(sampleOrder)
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Refacción de ejemplo")).toBeTruthy()
    await expect(canvas.queryByText(money(amounts.lines[0].price))).toBeNull()
    await expect(canvas.queryByText(money(amounts.total))).toBeNull()
  },
}

const sheetsOf = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll<HTMLElement>(".so-page-sheet"))

// Continuation rules: every sheet carries folio, logos and footer exactly once,
// the table header repeats once per sheet that has rows, and only the last
// sheet holds signatures and totals.
const expectMultipage = async (canvasElement: HTMLElement, count: number) => {
  const sheets = sheetsOf(canvasElement)
  await expect(sheets).toHaveLength(count)
  for (const sheet of sheets) {
    await expect(sheet.querySelectorAll(".so-header-folio")).toHaveLength(1)
    await expect(sheet.querySelectorAll(".so-footer-block")).toHaveLength(1)
    await expect(sheet.querySelectorAll(".so-partner-logos img")).toHaveLength(
      7
    )
    const tables = sheet.querySelectorAll(".so-parts-table tbody tr").length
      ? 1
      : 0
    await expect(sheet.querySelectorAll(".so-parts-table thead")).toHaveLength(
      tables
    )
  }
  await expect(
    sheets.at(-1)?.querySelector(".so-signatures-totals-row")
  ).toBeTruthy()
  for (const sheet of sheets.slice(0, -1))
    await expect(sheet.querySelector(".so-signatures-totals-row")).toBeNull()
  await expect(canvasElement.querySelector("embed, iframe, object")).toBeNull()
  const images = sheets.flatMap((sheet) =>
    Array.from(sheet.querySelectorAll("img"))
  )
  for (let attempt = 0; attempt < 50; attempt++) {
    if (images.every((image) => image.complete && image.naturalWidth)) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  await expect(true).toBe(false)
}

export const MultipageFull: Story = {
  args: { variant: "multipage", data: fullOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    await expectMultipage(canvasElement, 1)
    const canvas = within(canvasElement)
    await expect(canvas.getByText("SER-100")).toBeTruthy()
    await expect(canvas.getByText("Refacción de ejemplo 4")).toBeTruthy()
  },
}

export const MultipageOverCapacity: Story = {
  args: { variant: "multipage", data: overCapacityOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    await expectMultipage(canvasElement, 2)
    const canvas = within(canvasElement)
    await expect(canvas.getByText("SER-102")).toBeTruthy()
    await expect(canvas.getByText("Refacción de ejemplo 5")).toBeTruthy()
  },
}

export const MultiPage: Story = {
  args: { variant: "multipage", data: longOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    await expectMultipage(canvasElement, 3)
    const canvas = within(canvasElement)
    await expect(canvas.getByText("SER-100")).toBeTruthy()
    await expect(canvas.getByText("SER-108")).toBeTruthy()
    await expect(canvas.getByText("Refacción de ejemplo 14")).toBeTruthy()
  },
}

export const MultipageDense: Story = {
  args: { variant: "multipage", data: denseOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    await expectMultipage(canvasElement, 4)
    const sheets = sheetsOf(canvasElement)
    await expect(
      sheets[1].querySelectorAll(".so-equipment-item-box")
    ).toHaveLength(16)
    await expect(
      sheets[1].querySelectorAll(".so-parts-table tbody tr")
    ).toHaveLength(0)
    await expect(
      sheets[2].querySelectorAll(".so-parts-table tbody tr")
    ).toHaveLength(25)
    await expect(
      within(sheets[3]).getByText("Refacción de ejemplo 34")
    ).toBeTruthy()
  },
}

export const MultipageLongDescription: Story = {
  args: { variant: "multipage", data: longDescriptionOrder, showPrices: true },
  play: async ({ canvasElement }) => {
    await expectMultipage(canvasElement, 2)
    const text = sheetsOf(canvasElement).flatMap((sheet) =>
      (sheet.querySelector(".so-description-block")?.textContent ?? "").split(
        /\s+/
      )
    )
    await expect(text.filter((word) => word === "repetidas.")).toHaveLength(40)
  },
}
