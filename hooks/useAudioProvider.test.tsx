import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useAudioProvider } from "@/hooks/useAudioProvider"
import { useAudioStore } from "@/lib/audio/audio-store"

const audioState = vi.hoisted(() => ({
  audio: null as HTMLAudioElement | null,
  htmlAudio: {
    init: vi.fn(),
    getAudioElement: () => audioState.audio,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    isLive: () => false,
    getSource: () => null,
    play: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ htmlAudio: audioState.htmlAudio }),
}))

function AudioConsumer() {
  useAudioProvider()
  const duration = useAudioStore((state) => state.duration)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const isBuffering = useAudioStore((state) => state.isBuffering)
  return createElement(
    "output",
    null,
    `${duration}:${isPlaying}:${isBuffering}`
  )
}

describe("useAudioProvider playback events", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    audioState.audio = document.createElement("audio")
    Object.defineProperty(audioState.audio, "duration", {
      configurable: true,
      value: 180,
    })
    useAudioStore.setState({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      duration: 0,
      currentTime: 0,
    })
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
    act(() => root.render(createElement(AudioConsumer)))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it("preserves the known duration through buffering and playback", () => {
    act(() => {
      audioState.audio?.dispatchEvent(new Event("canplay"))
      audioState.audio?.dispatchEvent(new Event("waiting"))
    })
    expect(container.textContent).toBe("180:false:true")

    act(() => audioState.audio?.dispatchEvent(new Event("playing")))

    expect(container.textContent).toBe("180:true:false")
  })
})
