import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Fader } from "@/components/shared/assets/audio/Fader"

describe("Fader", () => {
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

  it("preserves controlled value, orientation, range, marks, and keyboard changes", async () => {
    const onValueChange = vi.fn()
    await act(async () =>
      root.render(
        createElement(Fader, {
          "aria-label": "Volume",
          max: 100,
          min: 0,
          onValueChange,
          orientation: "horizontal",
          size: "sm",
          step: 1,
          value: 50,
        })
      )
    )

    const slider = container.querySelector<HTMLInputElement>("input[type='range']")
    expect(slider?.getAttribute("aria-label")).toBe("Volume")
    expect(slider?.min).toBe("0")
    expect(slider?.max).toBe("100")
    expect(slider?.value).toBe("50")
    expect(slider?.getAttribute("aria-orientation")).toBe("horizontal")
    expect(container.querySelectorAll("[data-slot='fader-mark']")).toHaveLength(3)

    await act(async () =>
      slider?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    )
    expect(onValueChange).toHaveBeenCalledWith(51)
  })

  it("supports vertical controls and no thumb marks", async () => {
    await act(async () =>
      root.render(
        createElement(Fader, {
          "aria-label": "Gain",
          orientation: "vertical",
          thumbMarks: false,
          value: 0.5,
        })
      )
    )
    const slider = container.querySelector<HTMLInputElement>("input[type='range']")
    expect(slider?.getAttribute("aria-orientation")).toBe("vertical")
    expect(
      container.querySelector("[data-slot='fader-thumb'] > span")?.getAttribute("data-orientation")
    ).toBe("vertical")
    expect(container.querySelectorAll("[data-slot='fader-mark']")).toHaveLength(0)
  })

  it("defaults the thumb and marks to horizontal orientation", async () => {
    await act(async () =>
      root.render(createElement(Fader, { "aria-label": "Volume", value: 0.5 }))
    )

    expect(
      container.querySelector<HTMLInputElement>("input[type='range']")?.getAttribute("aria-orientation")
    ).toBe("horizontal")
    expect(
      container.querySelector("[data-slot='fader-thumb'] > span")?.getAttribute("data-orientation")
    ).toBe("horizontal")
    expect(
      Array.from(container.querySelectorAll<HTMLElement>("[data-slot='fader-mark']")).map(
        (mark) => mark.getAttribute("data-orientation")
      )
    ).toEqual(["horizontal", "horizontal", "horizontal"])
  })
})
