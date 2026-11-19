import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OrdersTableView } from "@/components/blocks/metrology/orders/OrdersTableView"
import type { OrdersTranslator } from "@/components/blocks/metrology/orders/order-display"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"

const orders = [
  {
    id: "order-1",
    folio: "OT-2026-001",
    date_created: "2026-01-02T12:00:00.000Z",
    status: "paid",
    client: { id: "client-1", name: "Cliente de prueba" },
    scales: [
      {
        scales_id: {
          id: "scale-1",
          title: "Báscula de prueba",
          serial_number: "SERIAL-001",
        },
      },
    ],
    technician_name: {
      id: "technician-1",
      first_name: "Ana",
      last_name: "Técnica",
    },
  },
] as OrdersQueryResult
const t = ((key: string) => key) as unknown as OrdersTranslator

describe("OrdersTableView sorting", () => {
  let container: HTMLDivElement
  let root: Root
  const onSortChange = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    onSortChange.mockReset()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it("renders the real order row with accessible server-sort headers", async () => {
    await act(async () =>
      root.render(
        createElement(OrdersTableView, {
          orders,
          t,
          sortBy: "date_created",
          sortDirection: "desc",
          onSortChange,
        })
      )
    )

    const table = container.querySelector("[aria-label='table.label']")
    expect(table?.textContent).toContain("OT-2026-001")
    expect(table?.textContent).toContain("2 ene 2026")
    expect(table?.textContent).toContain("Cliente de prueba")
    expect(table?.textContent).toContain("Báscula de prueba · SERIAL-001")
    expect(table?.textContent).toContain("Ana Técnica")
    expect(table?.textContent).toContain("status.paid")
    expect(
      container.querySelector("#date_created")?.getAttribute("aria-sort")
    ).toBe("descending")

    const folioSort = container.querySelector<HTMLButtonElement>(
      "button[aria-label='fields.folio']"
    )
    expect(folioSort).not.toBeNull()
    await act(async () => folioSort?.click())
    expect(onSortChange).toHaveBeenCalledWith({
      sortBy: "folio",
      sortDirection: "asc",
    })
  })
})
