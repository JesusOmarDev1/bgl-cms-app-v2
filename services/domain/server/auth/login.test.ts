import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => `T:${key}`),
}))
vi.mock("@/config/rate-limiter", () => ({
  loginLimiter: { consume: vi.fn() },
}))
vi.mock("@/lib/env/constants", () => ({
  DIRECTUS_URL: "https://directus.test",
  DIRECTUS_STATIC_TOKEN: "public-site-token",
  DIRECTUS_LOG_LEVEL: undefined,
}))

import { cookies, headers } from "next/headers"
import { loginLimiter } from "@/config/rate-limiter"
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/services/domain/server/auth/token"
import { login } from "@/services/domain/server/auth/login"

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

type FetchCall = {
  url: URL
  request: Request
  resolve: (response: Response) => void
}

function makeFetch(calls: FetchCall[], responses: (index: number) => Response) {
  return (_input: unknown, init?: RequestInit) => {
    return new Promise<Response>((resolve) => {
      const request = new Request(_input as string, init)
      calls.push({
        url: new URL(request.url),
        request,
        resolve: (response: Response) => resolve(response),
      })
      setTimeout(() => resolve(responses(calls.length - 1)), 0)
    })
  }
}

const authOk = {
  data: {
    access_token: "access-1",
    refresh_token: "refresh-1",
    expires: 900_000,
    expires_at: null,
  },
}

const directusError = (code: string) =>
  Response.json(
    { errors: [{ message: "redacted", extensions: { code } }] },
    { status: 401 }
  )

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("login server action", () => {
  it("logs in with JSON mode, verifies identity and sets employee cookies", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, (index) =>
        index === 0
          ? Response.json(authOk)
          : Response.json({ data: { id: "employee-1", role: "role-1" } })
      )
    )

    await expect(
      login({ email: "staff@example.com", password: "pw" })
    ).resolves.toEqual({ data: { ok: true } })

    expect(calls).toHaveLength(2)
    expect(calls[0].url.pathname).toBe("/auth/login")
    expect(await calls[0].request.json()).toEqual({
      email: "staff@example.com",
      password: "pw",
      mode: "json",
    })
    expect(calls[1].url.pathname).toBe("/users/me")
    expect(calls[1].url.searchParams.get("fields")).toContain("role")
    expect(calls[1].request.headers.get("authorization")).toBe(
      "Bearer access-1"
    )

    expect(store.set).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      "access-1",
      expect.objectContaining({ maxAge: 900, httpOnly: true, sameSite: "lax" })
    )
    expect(store.set).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE,
      "refresh-1",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    )
  })

  it("rejects users without a role before issuing cookies", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, (index) =>
        index === 0
          ? Response.json(authOk)
          : Response.json({ data: { id: "employee-1", role: null } })
      )
    )

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "noRole" })
    expect(store.set).not.toHaveBeenCalled()
  })

  it("returns a redacted failure without cookies on invalid credentials", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, () => directusError("INVALID_CREDENTIALS"))
    )

    const result = (await login({ email: "staff@example.com", password: "x" }))
      .data as { ok: false; message: string }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("invalidCredentials")
    expect(result.message).not.toContain("staff@example.com")
    expect(store.set).not.toHaveBeenCalled()
  })

  it("marks the form for MFA when Directus requires a verification code", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, () => directusError("INVALID_OTP"))
    )

    await expect(
      login({ email: "staff@example.com", password: "pw" })
    ).resolves.toMatchObject({
      data: { ok: false, message: "mfaRequired", mfaRequired: true },
    })
    expect(store.set).not.toHaveBeenCalled()

    await expect(
      login({ email: "staff@example.com", password: "pw", otp: "123456" })
    ).resolves.toMatchObject({
      data: { ok: false, message: "mfaInvalid", mfaRequired: true },
    })
    expect(store.set).not.toHaveBeenCalled()
  })

  it("rate limits by client IP before touching Directus", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "::ffff:203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockRejectedValue(new Error("limited"))
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(loginLimiter.consume).toHaveBeenCalledWith("203.0.113.4")
    expect(result.message).toBe("rateLimited")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })

  it("reports unavailability instead of wrong credentials on transport failure", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed")
      })
    )

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result.message).toBe("unavailable")
    expect(store.set).not.toHaveBeenCalled()
  })

  it("fails closed with an unavailability message on a multi-hop forwarding header", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result.message).toBe("unavailable")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })
})
