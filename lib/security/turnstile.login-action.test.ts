import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/env/constants", () => ({
  TURNSTILE_FORM_ACTION: "submit_form",
  TURNSTILE_LOGIN_ACTION: "login",
  get TURNSTILE_SECRET_KEY() {
    return process.env.TURNSTILE_SECRET_KEY ?? ""
  },
  get TURNSTILE_VERIFY_URL() {
    return process.env.TURNSTILE_VERIFY_URL ?? ""
  },
}))

import { TURNSTILE_LOGIN_ACTION } from "@/lib/env/constants"
import { verifyTurnstile } from "@/lib/security/turnstile"

const payload = (action: string) => ({
  ok: true,
  json: async () => ({ success: true, action }),
})

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")
  vi.stubEnv("TURNSTILE_VERIFY_URL", "https://turnstile.test")
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("verifyTurnstile login action", () => {
  it("accepts a login token only for the login action", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    fetchMock.mockResolvedValueOnce(payload(TURNSTILE_LOGIN_ACTION))
    expect(await verifyTurnstile("token", TURNSTILE_LOGIN_ACTION)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    fetchMock.mockResolvedValueOnce(payload(TURNSTILE_LOGIN_ACTION))
    expect(await verifyTurnstile("token", "submit_form")).toBe(false)
  })

  it("keeps the submit_form default intact", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    fetchMock.mockResolvedValueOnce(payload("submit_form"))
    expect(await verifyTurnstile("token")).toBe(true)

    fetchMock.mockResolvedValueOnce(payload(TURNSTILE_LOGIN_ACTION))
    expect(await verifyTurnstile("token")).toBe(false)
  })

  it("fails closed without a secret or a verify url, without calling fetch", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    vi.stubEnv("TURNSTILE_SECRET_KEY", "")
    expect(await verifyTurnstile("token", TURNSTILE_LOGIN_ACTION)).toBe(false)

    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")
    vi.stubEnv("TURNSTILE_VERIFY_URL", "")
    expect(await verifyTurnstile("token", TURNSTILE_LOGIN_ACTION)).toBe(false)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
