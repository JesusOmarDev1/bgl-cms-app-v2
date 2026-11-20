import { act, createElement, useState } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Transport } from "@/components/shared/assets/audio/Transport"

function ControlledTransport({
  onSeek,
  bufferedValue = 0,
}: {
  onSeek: (value: number) => void
  bufferedValue?: number
}) {
  const [value, setValue] = useState(0)
  return createElement(Transport, {
    "aria-label": "Seek",
    bufferedValue,
    freezeValuesWhileDragging: true,
    max: 100,
    min: 0,
    onSeek: (nextValue) => {
      setValue(nextValue)
      onSeek(nextValue)
    },
    value,
  })
}

describe("Transport", () => {
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

  it("preserves accessible value, orientation, buffered progress, and keyboard seeking", async () => {
    const onSeek = vi.fn()
    await act(async () =>
      root.render(
        createElement(Transport, {
          "aria-label": "Seek",
          bufferedValue: 75,
          max: 100,
          min: 0,
          onSeek,
          orientation: "horizontal",
          value: 40,
        })
      )
    )

    const slider = container.querySelector<HTMLInputElement>("input[type='range']")
    expect(slider?.getAttribute("aria-label")).toBe("Seek")
    expect(slider?.min).toBe("0")
    expect(slider?.max).toBe("100")
    expect(slider?.value).toBe("40")
    expect(container.querySelector("[data-orientation='horizontal']")).not.toBeNull()
    expect(
      container.querySelector<HTMLElement>("[data-slot='transport-buffered']")?.style.width
    ).toBe("75%")

    await act(async () =>
      slider?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    )
    expect(onSeek).toHaveBeenCalledWith(41)
  })

  it("restores updated buffered progress when pointer capture ends outside the slider", async () => {
    const onSeek = vi.fn()
    await act(async () =>
      root.render(createElement(ControlledTransport, { bufferedValue: 75, onSeek }))
    )

    const track = container.querySelector<HTMLElement>("[data-slot='transport-track']")
    expect(track).not.toBeNull()
    if (!track) return
    track.getBoundingClientRect = () =>
      ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }) as DOMRect

    await act(async () =>
      track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 60, clientY: 5 }))
    )
    await act(async () =>
      root.render(createElement(ControlledTransport, { bufferedValue: 90, onSeek }))
    )
    const buffered = () =>
      container.querySelector<HTMLElement>("[data-slot='transport-buffered']")?.style.width
    expect(buffered()).toBe("75%")

    await act(async () =>
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 60, clientY: 5 }))
    )
    await act(async () =>
      root.render(createElement(ControlledTransport, { bufferedValue: 90, onSeek }))
    )
    expect(buffered()).toBe("90%")
  })

  it("seeks by pointer interaction", async () => {
    const onSeek = vi.fn()
    await act(async () =>
      root.render(createElement(ControlledTransport, { onSeek }))
    )

    const track = container.querySelector<HTMLElement>("[data-slot='transport-track']")
    expect(track).not.toBeNull()
    if (!track) return
    track.getBoundingClientRect = () =>
      ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }) as DOMRect
    await act(async () =>
      track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 60, clientY: 5 }))
    )
    await act(async () =>
      window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 80, clientY: 5 }))
    )
    await act(async () =>
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 80, clientY: 5 }))
    )
    expect(onSeek).toHaveBeenCalled()
    expect(onSeek.mock.calls.at(-1)?.[0]).toBe(80)
  })
})
