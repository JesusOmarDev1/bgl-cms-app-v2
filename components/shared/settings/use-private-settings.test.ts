import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  parsePrivateSettings,
  persistPrivateSettings,
} from "./use-private-settings"

const store = new Map<string, string>()
const localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
}

beforeEach(() => {
  store.clear()
  vi.stubGlobal("window", { localStorage })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("parsePrivateSettings", () => {
  it("keeps a valid motion preference", () => {
    expect(parsePrivateSettings('{"motion":"reduce"}')).toEqual({
      motion: "reduce",
    })
  })

  it("ignores a leftover fontSize without losing the rest", () => {
    expect(
      parsePrivateSettings('{"fontSize":"large","motion":"reduce"}')
    ).toEqual({ motion: "reduce" })
    expect(parsePrivateSettings('{"fontSize":"large"}')).toEqual({})
  })

  it("drops an unknown motion value", () => {
    expect(parsePrivateSettings('{"motion":"sometimes"}')).toEqual({})
  })

  it("returns null for a missing or unreadable payload", () => {
    expect(parsePrivateSettings(null)).toBeNull()
    expect(parsePrivateSettings("")).toBeNull()
    expect(parsePrivateSettings("not json")).toBeNull()
  })
})

describe("persistPrivateSettings", () => {
  it("writes only the supported keys", () => {
    persistPrivateSettings({ motion: "full" })

    expect([...store.values()]).toEqual(['{"motion":"full"}'])
  })

  it("round-trips through the parser", () => {
    persistPrivateSettings({ motion: "reduce" })

    expect(parsePrivateSettings([...store.values()][0]!)).toEqual({
      motion: "reduce",
    })
  })
})
