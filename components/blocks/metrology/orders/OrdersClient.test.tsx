import { act, createElement } from "react"
import type { ComponentProps, ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const consoleErrors: string[] = []
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | null = null
const harness = vi.hoisted(() => ({
  query: {
    status: "paid",
    q: "",
    dateMode: null,
    from: null,
    to: null,
    days: null,
    page: 3,
    view: null as "table" | "list" | null,
    sortBy: "date_created",
    sortDirection: "desc",
  },
  setQuery: vi.fn(),
}))

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => createElement("a", props),
}))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock("nuqs", () => {
  const parser = { withDefault: () => parser }
  return {
    parseAsArrayOf: () => parser,
    parseAsInteger: parser,
    parseAsString: parser,
    parseAsStringLiteral: () => parser,
    useQueryStates: () => [harness.query, harness.setQuery],
  }
})
vi.mock("@/components/ui/pagination", () => {
  const Wrapper = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children)
  return {
    Pagination: Wrapper,
    PaginationContent: Wrapper,
    PaginationItem: Wrapper,
    PaginationNext: () => createElement("button"),
    PaginationPrevious: () => createElement("button"),
  }
})
vi.mock("@/components/ui/item", () => ({
  ItemGroup: (props: ComponentProps<"div">) => createElement("div", props),
  Item: (props: ComponentProps<"div">) => createElement("div", props),
  ItemContent: (props: ComponentProps<"div">) => createElement("div", props),
  ItemDescription: (props: ComponentProps<"p">) => createElement("p", props),
  ItemTitle: (props: ComponentProps<"div">) => createElement("div", props),
}))

import { OrdersClient } from "@/components/blocks/metrology/orders/OrdersClient"
import type { OrdersQueryResult } from "@/services/domain/db/repositories/collections/order"

describe("OrdersClient status tabs", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    harness.query.view = null
    harness.query.page = 3
    harness.query.sortBy = "date_created"
    harness.query.sortDirection = "desc"
    harness.setQuery.mockReset()
    consoleErrors.length = 0
    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(" "))
      })
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    consoleErrorSpy?.mockRestore()
    consoleErrorSpy = null
    vi.unstubAllGlobals()
  })

  it("renders real order fields in table and list view states", async () => {
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

    harness.query.view = "table"
    await act(async () => root.render(createElement(OrdersClient, { orders })))

    const table = container.querySelector<HTMLElement>("[aria-label='table.label']")
    expect(table).not.toBeNull()
    expect(table?.textContent).toContain("fields.folio")
    expect(table?.textContent).toContain("OT-2026-001")
    expect(table?.textContent).toContain("2 ene 2026")
    expect(table?.textContent).toContain("Cliente de prueba")
    expect(table?.textContent).toContain("Báscula de prueba · SERIAL-001")
    expect(table?.textContent).toContain("Ana Técnica")
    expect(table?.textContent).toContain("status.paid")

    const folioSort = container.querySelector<HTMLButtonElement>(
      "button[aria-label='fields.folio']"
    )
    expect(folioSort).not.toBeNull()
    await act(async () => folioSort?.click())
    expect(harness.setQuery).toHaveBeenCalledWith({
      sortBy: "folio",
      sortDirection: "asc",
      page: 1,
    })

    harness.query.view = "list"
    await act(async () => root.render(createElement(OrdersClient, { orders })))

    const list = container.querySelector<HTMLElement>("[aria-label='list.label']")
    expect(list).not.toBeNull()
    expect(list?.textContent).toContain("OT-2026-001")
    expect(list?.textContent).toContain("2 ene 2026")
    expect(list?.textContent).toContain("Cliente de prueba")
    expect(list?.textContent).toContain("Báscula de prueba · SERIAL-001")
    expect(list?.textContent).toContain("Ana Técnica")
    expect(list?.textContent).toContain("status.paid")
  })

  it("renders tooltip triggers without Focusable ref-forwarding errors", async () => {
    await act(async () =>
      root.render(createElement(OrdersClient, { orders: [] }))
    )

    const focusableErrors = consoleErrors.filter((message) =>
      message.includes("<Focusable> child must forward its ref")
    )
    expect(focusableErrors).toEqual([])
  })

  it("uses line tabs with a linked panel and resets pagination for status filters", async () => {
    await act(async () =>
      root.render(createElement(OrdersClient, { orders: [] }))
    )

    const tabList = container.querySelector<HTMLElement>("[role='tablist']")
    const paidTab = Array.from(
      container.querySelectorAll<HTMLElement>("[role='tab']")
    ).find((tab) => tab.textContent === "tabs.paid")
    const draftTab = Array.from(
      container.querySelectorAll<HTMLElement>("[role='tab']")
    ).find((tab) => tab.textContent === "tabs.drafts")

    expect(tabList?.getAttribute("data-variant")).toBe("line")
    expect(paidTab?.getAttribute("aria-selected")).toBe("true")
    const panelId = paidTab?.getAttribute("aria-controls")
    const panel = panelId ? document.getElementById(panelId) : null
    expect(panel?.getAttribute("role")).toBe("tabpanel")
    expect(panel?.getAttribute("aria-labelledby")).toBe(paidTab?.id)
    expect(draftTab).toBeDefined()
    await act(async () => draftTab?.click())
    expect(harness.setQuery).toHaveBeenCalledWith({ status: "draft", page: 1 })
  })

  it("keeps horizontal status-tab scrolling without vertical overflow", async () => {
    await act(async () =>
      root.render(createElement(OrdersClient, { orders: [] }))
    )

    const tabList = container.querySelector<HTMLElement>("[role='tablist']")
    expect(tabList?.className).toContain("overflow-x-auto")
    expect(tabList?.className).toContain("overflow-y-hidden")
    expect(tabList?.classList.contains("h-13")).toBe(false)
    expect(tabList?.classList.contains("group-data-horizontal/tabs:h-13")).toBe(
      true
    )
  })

  it("updates the status filter with horizontal keyboard navigation", async () => {
    await act(async () =>
      root.render(createElement(OrdersClient, { orders: [] }))
    )

    const paidTab = Array.from(
      container.querySelectorAll<HTMLElement>("[role='tab']")
    ).find((tab) => tab.textContent === "tabs.paid")

    await act(async () => {
      paidTab?.focus()
      paidTab?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
      )
    })

    expect(harness.setQuery).toHaveBeenCalledWith({
      status: "cancelled",
      page: 1,
    })
  })
})
