import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/env/constants", () => ({
  TURNSTILE_FORM_ACTION: "submit_form",
  TURNSTILE_SECRET_KEY: "secret",
  TURNSTILE_VERIFY_URL: "https://turnstile.test",
}))

import { TURNSTILE_FORM_ACTION } from "@/lib/env/constants"
import { verifyTurnstile } from "@/lib/security/turnstile"

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it("fails without a token and accepts only the expected action", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    expect(await verifyTurnstile(" ")).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: TURNSTILE_FORM_ACTION }),
    })
    expect(await verifyTurnstile("token")).toBe(true)
    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(requestOptions.signal).toBeInstanceOf(AbortSignal)

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "other" }),
    })
    expect(await verifyTurnstile("token")).toBe(false)
  })

  it("fails closed for HTTP, JSON, and network errors", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await verifyTurnstile("token")).toBe(false)
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => "invalid" })
    expect(await verifyTurnstile("token")).toBe(false)
    fetchMock.mockRejectedValueOnce(new Error("network"))
    expect(await verifyTurnstile("token")).toBe(false)
  })
})
