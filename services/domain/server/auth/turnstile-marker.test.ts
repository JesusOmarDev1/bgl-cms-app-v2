import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/env/constants", () => ({
  get TURNSTILE_SECRET_KEY() {
    return process.env.TURNSTILE_SECRET_KEY ?? ""
  },
}))

import {
  TURNSTILE_MARKER_COOKIE,
  clearTurnstileMarker,
  hasValidTurnstileMarker,
  issueTurnstileMarker,
} from "@/services/domain/server/auth/turnstile-marker"

type CookieStore = Parameters<typeof issueTurnstileMarker>[0]

function makeStore() {
  const jar = new Map<string, string>()
  const set = vi.fn((name: string, value: string) => {
    jar.set(name, value)
  })
  const remove = vi.fn((name: string) => {
    jar.delete(name)
  })
  return {
    jar,
    set,
    remove,
    store: {
      get: (name: string) =>
        jar.has(name) ? { name, value: jar.get(name) } : undefined,
      set,
      delete: remove,
    } as unknown as CookieStore,
  }
}

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe("turnstile marker", () => {
  it("writes a short-lived httpOnly marker that carries no email", () => {
    const { jar, set, store } = makeStore()

    issueTurnstileMarker(store, "staff@example.com")

    expect(set).toHaveBeenCalledWith(
      TURNSTILE_MARKER_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 300,
      })
    )
    const value = jar.get(TURNSTILE_MARKER_COOKIE) ?? ""
    expect(value).toMatch(/^[\w-]+\.[\w-]+$/)
    expect(value).not.toContain("staff@example.com")
  })

  it("accepts its own marker for the same email regardless of case", () => {
    const { store } = makeStore()

    issueTurnstileMarker(store, "Staff@Example.com")

    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(true)
  })

  it("rejects the marker once its 300 seconds are gone", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-13T10:00:00.000Z"))
    const { store } = makeStore()
    issueTurnstileMarker(store, "staff@example.com")

    vi.setSystemTime(new Date("2026-11-13T10:05:01.000Z"))

    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(false)
  })

  it("rejects a marker signed with another secret", () => {
    const { store } = makeStore()
    issueTurnstileMarker(store, "staff@example.com")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "another-secret")

    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(false)
  })

  it("rejects a marker issued for another email", () => {
    const { store } = makeStore()
    issueTurnstileMarker(store, "staff@example.com")

    expect(hasValidTurnstileMarker(store, "other@example.com")).toBe(false)
  })

  it("rejects a tampered payload", () => {
    const { jar, store } = makeStore()
    issueTurnstileMarker(store, "staff@example.com")
    const [payload, signature] = (jar.get(TURNSTILE_MARKER_COOKIE) ?? "").split(
      "."
    )
    const forged = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp: number; e: string }
    forged.exp = Date.now() + 600_000
    jar.set(
      TURNSTILE_MARKER_COOKIE,
      `${Buffer.from(JSON.stringify(forged)).toString("base64url")}.${signature}`
    )

    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(false)
  })

  it("fails closed without a marker or without a configured secret", () => {
    const { store } = makeStore()
    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(false)

    issueTurnstileMarker(store, "staff@example.com")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "")

    expect(hasValidTurnstileMarker(store, "staff@example.com")).toBe(false)
  })

  it("clears the marker cookie", () => {
    const { jar, remove, store } = makeStore()
    issueTurnstileMarker(store, "staff@example.com")

    clearTurnstileMarker(store)

    expect(remove).toHaveBeenCalledWith(TURNSTILE_MARKER_COOKIE)
    expect(jar.has(TURNSTILE_MARKER_COOKIE)).toBe(false)
  })
})
