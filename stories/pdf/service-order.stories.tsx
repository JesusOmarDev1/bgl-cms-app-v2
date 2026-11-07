/// <reference types="vite/client" />
import { useEffect, useState } from "react"
import { init, renderDocument } from "@formepdf/core/worker"
import wasmUrl from "@formepdf/core/pkg-web/forme_bg.wasm?url"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import {
  ServiceOrderPreview,
  serviceOrderAmounts,
  type ServiceOrderData,
} from "@/components/pdf/templates/service-order"

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

function ServiceOrderStory({
  variant = "blank",
}: {
  variant?: "blank" | "filled"
}) {
  const [pdfUrl, setPdfUrl] = useState<string>()
  const [error, setError] = useState<string>()

  // Static local Storybook assets; cleanup revokes the generated PDF URL.
  useEffect(() => {
    let cancelled = false
    let url: string | undefined
    async function generate() {
      try {
        await init(new URL(wasmUrl, window.location.href))
        const bytes = await renderDocument(
          variant === "filled" ? (
            <ServiceOrderPreview
              variant="filled"
              data={sampleOrder}
              showPrices
            />
          ) : (
            <ServiceOrderPreview variant="blank" />
          )
        )
        url = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
        )
        if (cancelled) URL.revokeObjectURL(url)
        else setPdfUrl(url)
      } catch (reason) {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : String(reason))
      }
    }
    void generate()
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [variant])

  return (
    <div
      style={{
        background: "#181818",
        minHeight: "100vh",
        padding: 24,
        textAlign: "center",
      }}
    >
      {error ? <p role="alert">No se pudo generar el PDF: {error}</p> : null}
      {!error && !pdfUrl ? <p>Generando vista previa del PDF…</p> : null}
      {pdfUrl ? (
        <embed
          title="Orden de servicio — PDF de muestra"
          src={pdfUrl}
          style={{
            background: "white",
            border: 0,
            height: 1060,
            maxWidth: "100%",
            width: 790,
          }}
        />
      ) : null}
    </div>
  )
}

const meta = {
  title: "Orden de servicio",
  component: ServiceOrderStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ServiceOrderStory>

export default meta
type Story = StoryObj<typeof meta>

export const Filled: Story = {
  args: { variant: "filled" },
  play: async ({ canvasElement }) => {
    const amounts = serviceOrderAmounts(sampleOrder)
    await expect(amounts.parts).toBe(3100)
    await expect(amounts.subtotal).toBe(13100)
    await expect(amounts.vat).toBe(2096)
    await expect(amounts.total).toBe(15196)
    await expect(
      serviceOrderAmounts({ ...sampleOrder, parts: [], labor_cost: "0.04" }).vat
    ).toBe(1)
    await expect(
      serviceOrderAmounts({
        ...sampleOrder,
        parts: [
          { quantity: 2, inventory_id: { title: "Sin precio", price: null } },
        ],
      }).total
    ).toBeNull()
    await expect(
      serviceOrderAmounts({
        ...sampleOrder,
        parts: [],
        labor_cost: null,
      }).total
    ).toBeNull()
    const secondPage = await renderDocument(
      <ServiceOrderPreview
        variant="filled"
        data={{
          ...sampleOrder,
          scales: [
            ...sampleOrder.scales,
            {
              scales_id: {
                ...sampleOrder.scales[0].scales_id,
                id: "123e4567-e89b-42d3-a456-426614174006",
              },
            },
            {
              scales_id: {
                ...sampleOrder.scales[0].scales_id,
                id: "123e4567-e89b-42d3-a456-426614174005",
              },
            },
          ],
          parts: [
            ...sampleOrder.parts,
            ...[2, 3, 4].map((i) => ({
              quantity: 1,
              inventory_id: { title: `Refacción ${i}`, price: "1.00" },
            })),
          ],
        }}
      />
    )
    await expect(
      new TextDecoder("latin1").decode(secondPage).match(/\/Type\s*\/Page\b/g)
        ?.length
    ).toBe(2)
    const iframe = (await within(canvasElement).findByTitle(
      "Orden de servicio — PDF de muestra",
      {},
      { timeout: 30000 }
    )) as HTMLIFrameElement
    const bytes = new Uint8Array(await (await fetch(iframe.src)).arrayBuffer())
    await expect(new TextDecoder().decode(bytes.subarray(0, 5))).toBe("%PDF-")
  },
}

export const BlankForm: Story = {
  play: async ({ canvasElement }) => {
    const iframe = (await within(canvasElement).findByTitle(
      "Orden de servicio — PDF de muestra",
      {},
      { timeout: 30000 }
    )) as HTMLIFrameElement
    const bytes = new Uint8Array(await (await fetch(iframe.src)).arrayBuffer())
    await expect(new TextDecoder().decode(bytes.subarray(0, 5))).toBe("%PDF-")
    const pdf = new TextDecoder("latin1").decode(bytes)
    await expect(
      pdf.match(/\/Subtype\s*\/Image\b/g)?.length ?? 0
    ).toBeGreaterThanOrEqual(9)
  },
}
