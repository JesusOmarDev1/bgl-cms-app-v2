import { act, createElement } from "react"
import type { ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DateRangePicker } from "@/components/shared/forms/DateRangePicker"

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => createElement("a", props),
}))

function selectedDays(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      "[data-day][aria-selected='true']"
    )
  ).map((button) => Number(button.dataset.day))
}

describe("DateRangePicker", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it("selects an inclusive range and clears it", async () => {
    const onValueChange = vi.fn()
    await act(async () =>
      root.render(
        createElement(DateRangePicker, {
          defaultMonth: new Date(2024, 0, 1),
          onValueChange,
        })
      )
    )
    await act(async () =>
      container
        .querySelector<HTMLButtonElement>(
          "[data-slot='date-range-picker-trigger']"
        )
        ?.click()
    )
    const period = document.body.querySelector<HTMLButtonElement>(
      "[data-mode='range']"
    )
    await act(async () => period?.click())
    const days = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("[data-day]")
    )
    await act(async () => days.find((day) => day.textContent === "10")?.click())
    await act(async () => days.find((day) => day.textContent === "12")?.click())

    expect(selectedDays(document.body)).toEqual([
      new Date(2024, 0, 10).getTime(),
      new Date(2024, 0, 11).getTime(),
      new Date(2024, 0, 12).getTime(),
    ])
    expect(onValueChange).toHaveBeenLastCalledWith({
      mode: "range",
      start: new Date(2024, 0, 10),
      end: new Date(2024, 0, 12),
    })
    const clear = Array.from(document.body.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Limpiar")
    )
    await act(async () => clear?.click())
    expect(selectedDays(document.body)).toEqual([])
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it("toggles specific days and switching modes drops the previous selection", async () => {
    const onValueChange = vi.fn()
    await act(async () =>
      root.render(
        createElement(DateRangePicker, {
          defaultMonth: new Date(2024, 0, 1),
          onValueChange,
        })
      )
    )
    await act(async () =>
      container
        .querySelector<HTMLButtonElement>(
          "[data-slot='date-range-picker-trigger']"
        )
        ?.click()
    )
    await act(async () =>
      document.body
        .querySelector<HTMLButtonElement>("[data-mode='days']")
        ?.click()
    )
    const dayButtons = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("[data-day]")
    )
    await act(async () =>
      dayButtons.find((day) => day.textContent === "5")?.click()
    )
    await act(async () =>
      dayButtons.find((day) => day.textContent === "18")?.click()
    )
    expect(selectedDays(document.body)).toEqual([
      new Date(2024, 0, 5).getTime(),
      new Date(2024, 0, 18).getTime(),
    ])
    expect(onValueChange).toHaveBeenLastCalledWith({
      mode: "days",
      days: [new Date(2024, 0, 5), new Date(2024, 0, 18)],
    })

    await act(async () =>
      document.body
        .querySelector<HTMLButtonElement>("[data-mode='range']")
        ?.click()
    )
    expect(selectedDays(document.body)).toEqual([])
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it("keeps the calendar day reachable when bounds include a non-midnight time", async () => {
    await act(async () =>
      root.render(
        createElement(DateRangePicker, {
          defaultMonth: new Date(2024, 0, 1),
          min: new Date(2024, 0, 10, 17),
          max: new Date(2024, 0, 10, 18),
        })
      )
    )
    await act(async () =>
      container
        .querySelector<HTMLButtonElement>(
          "[data-slot='date-range-picker-trigger']"
        )
        ?.click()
    )
    const day = document.body.querySelector<HTMLButtonElement>(
      `[data-day="${new Date(2024, 0, 10).getTime()}"]`
    )
    expect(day?.disabled).toBe(false)
    expect(day?.tabIndex).toBe(0)
  })

  it("follows externally controlled mode changes", async () => {
    const rangeValue = {
      mode: "range" as const,
      start: new Date(2024, 0, 10),
      end: null,
    }
    await act(async () =>
      root.render(
        createElement(DateRangePicker, {
          value: rangeValue,
          defaultMonth: new Date(2024, 0, 1),
        })
      )
    )
    await act(async () =>
      container
        .querySelector<HTMLButtonElement>(
          "[data-slot='date-range-picker-trigger']"
        )
        ?.click()
    )
    expect(
      document.body
        .querySelector<HTMLButtonElement>("[data-mode='range']")
        ?.getAttribute("aria-pressed")
    ).toBe("true")

    await act(async () =>
      root.render(
        createElement(DateRangePicker, {
          value: { mode: "days", days: [new Date(2024, 0, 18)] },
          defaultMonth: new Date(2024, 0, 1),
        })
      )
    )
    expect(
      document.body
        .querySelector<HTMLButtonElement>("[data-mode='days']")
        ?.getAttribute("aria-pressed")
    ).toBe("true")
    expect(selectedDays(document.body)).toEqual([
      new Date(2024, 0, 18).getTime(),
    ])
  })
})
