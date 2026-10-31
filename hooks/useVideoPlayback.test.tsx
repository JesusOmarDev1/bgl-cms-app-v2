import React, { act, createElement, useRef } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useVideoPlayback } from "@/hooks/useVideoPlayback"

function VideoConsumer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isPlaying, setIsPlaying, togglePlay } = useVideoPlayback(videoRef, {
    src: "/video.mp4",
    tracks: [],
  })
  return (
    <div>
      <video
        ref={videoRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button onClick={togglePlay}>toggle</button>
      <output>{String(isPlaying)}</output>
    </div>
  )
}

describe("useVideoPlayback togglePlay", () => {
  let container: HTMLDivElement
  let root: Root
  let video: HTMLVideoElement
  let play: ReturnType<typeof vi.spyOn>
  let pause: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
    act(() => root.render(createElement(VideoConsumer)))
    video = container.querySelector("video")!
    play = vi.spyOn(video, "play")
    pause = vi.spyOn(video, "pause")
  })

  afterEach(() => {
    play.mockRestore()
    pause.mockRestore()
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it("does not mark playback active or emit an unhandled rejection when play rejects", async () => {
    const unhandledRejections: PromiseRejectionEvent[] = []
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      unhandledRejections.push(event)
    }
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    play.mockRejectedValue(new DOMException("Not allowed", "NotAllowedError"))

    await act(async () => {
      container.querySelector("button")?.click()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    expect(container.querySelector("output")?.textContent).toBe("false")
    expect(unhandledRejections).toHaveLength(0)
    expect(play).toHaveBeenCalledOnce()
  })

  it("preserves successful play and pause event synchronization", async () => {
    play.mockImplementation(() => {
      video.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    pause.mockImplementation(() => {
      video.dispatchEvent(new Event("pause"))
    })

    await act(async () => {
      container.querySelector("button")?.click()
      await Promise.resolve()
    })
    expect(container.querySelector("output")?.textContent).toBe("true")

    act(() => container.querySelector("button")?.click())
    expect(pause).toHaveBeenCalledOnce()
    expect(container.querySelector("output")?.textContent).toBe("false")
  })
})
