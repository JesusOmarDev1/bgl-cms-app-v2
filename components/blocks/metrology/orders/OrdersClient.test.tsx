import { act, createElement } from "react"
import type { ComponentProps, ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const harness = vi.hoisted(() => ({
  query: {
    status: "paid",
    q: "",
    dateMode: null,
    from: null,
    to: null,
    days: null,
    page: 3,
    view: null,
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

import { OrdersClient } from "@/components/blocks/metrology/orders/OrdersClient"

describe("OrdersClient status tabs", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    harness.setQuery.mockReset()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
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
    expect(tabList?.classList.contains("group-data-horizontal/tabs:h-13")).toBe(true)
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

    expect(harness.setQuery).toHaveBeenCalledWith({ status: "cancelled", page: 1 })
  })
})
