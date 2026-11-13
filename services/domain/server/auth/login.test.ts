import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
  TURNSTILE_LOGIN_ACTION: "login",
  get TURNSTILE_SECRET_KEY() {
    return process.env.TURNSTILE_SECRET_KEY ?? ""
  },
}))
vi.mock("@/lib/security/turnstile", () => ({ verifyTurnstile: vi.fn() }))

import { cookies, headers } from "next/headers"
import { loginLimiter } from "@/config/rate-limiter"
import { verifyTurnstile } from "@/lib/security/turnstile"
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/services/domain/server/auth/token"
import {
  TURNSTILE_MARKER_COOKIE,
  hasValidTurnstileMarker,
} from "@/services/domain/server/auth/turnstile-marker"
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

/** Stateful jar: the marker issued by one submission is read by the next. */
function makeJar() {
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
    },
  }
}

function wireRequest(jar: ReturnType<typeof makeJar>) {
  vi.mocked(headers).mockResolvedValue(
    new Headers({ "x-forwarded-for": "203.0.113.4" })
  )
  vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
  vi.mocked(cookies).mockResolvedValue(jar.store as never)
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

beforeEach(() => {
  // Turnstile stays off unless a test turns it on, whatever the ambient env.
  vi.stubEnv("TURNSTILE_SECRET_KEY", "")
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
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
    expect(calls[1].url.searchParams.get("fields")).toBe("role")
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

  it.each([
    ["INVALID_CREDENTIALS", "invalidCredentials"],
    ["REQUESTS_EXCEEDED", "rateLimited"],
    ["SERVICE_UNAVAILABLE", "unavailable"],
    ["CODE_INVENTADO", "generic"],
  ])("maps the official %s code to %s", async (code, expected) => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, () => directusError(code))
    )

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: expected })
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

  it("reports unavailability instead of a generic failure when Directus is down", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const calls: FetchCall[] = []
    vi.stubGlobal(
      "fetch",
      makeFetch(calls, () =>
        Response.json(
          {
            errors: [
              {
                message: "redacted",
                extensions: { code: "SERVICE_UNAVAILABLE" },
              },
            ],
          },
          { status: 503 }
        )
      )
    )

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "unavailable" })
    expect(store.set).not.toHaveBeenCalled()
  })

  it("fails closed when turnstile is configured and no captcha token is sent", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(false)
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await login({ email: "staff@example.com", password: "pw" }))
      .data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "turnstileFailed" })
    expect(verifyTurnstile).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })

  it("rejects a failed captcha without consuming the rate limiter", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(false)
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.4" })
    )
    vi.mocked(loginLimiter.consume).mockResolvedValue({} as never)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (
      await login({
        email: "staff@example.com",
        password: "pw",
        captcha: "bad-token",
      })
    ).data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "turnstileFailed" })
    expect(verifyTurnstile).toHaveBeenCalledWith("bad-token", "login")
    expect(loginLimiter.consume).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })

  it("logs in normally when turnstile accepts the token", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
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
      login({
        email: "staff@example.com",
        password: "pw",
        captcha: "good-token",
      })
    ).resolves.toEqual({ data: { ok: true } })

    expect(verifyTurnstile).toHaveBeenCalledWith("good-token", "login")
    expect(loginLimiter.consume).toHaveBeenCalledWith("203.0.113.4")
    expect(calls).toHaveLength(2)
    expect(store.set).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      "access-1",
      expect.objectContaining({ httpOnly: true })
    )
  })

  it("ignores the captcha when no turnstile secret is configured", async () => {
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
      login({
        email: "staff@example.com",
        password: "pw",
        captcha: "ignored-token",
      })
    ).resolves.toEqual({ data: { ok: true } })

    expect(verifyTurnstile).not.toHaveBeenCalled()
    expect(calls).toHaveLength(2)
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

  it("issues the marker only when a passed challenge reaches the OTP step", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_OTP"))
    )

    const result = (
      await login({
        email: "staff@example.com",
        password: "pw",
        captcha: "good-token",
      })
    ).data as { ok: false; message: string }

    expect(result.message).toBe("mfaRequired")
    expect(jar.jar.get(TURNSTILE_MARKER_COOKIE)).toBeTruthy()
    expect(
      hasValidTurnstileMarker(jar.store as never, "staff@example.com")
    ).toBe(true)
  })

  it("completes the OTP step from the marker without re-verifying the challenge", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_OTP"))
    )
    await login({
      email: "staff@example.com",
      password: "pw",
      captcha: "good-token",
    })

    vi.mocked(verifyTurnstile).mockClear()
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
      login({ email: "staff@example.com", password: "pw", otp: "123456" })
    ).resolves.toEqual({ data: { ok: true } })

    expect(verifyTurnstile).not.toHaveBeenCalled()
    expect(loginLimiter.consume).toHaveBeenCalledTimes(2)
    expect(calls).toHaveLength(2)
    expect(jar.remove).toHaveBeenCalledWith(TURNSTILE_MARKER_COOKIE)
    expect(jar.jar.has(TURNSTILE_MARKER_COOKIE)).toBe(false)
  })

  it("rejects an expired marker without calling the limiter or Directus", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-13T10:00:00.000Z"))
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_OTP"))
    )
    await login({
      email: "staff@example.com",
      password: "pw",
      captcha: "good-token",
    })

    vi.setSystemTime(new Date("2026-11-13T10:05:01.000Z"))
    vi.mocked(loginLimiter.consume).mockClear()
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (
      await login({ email: "staff@example.com", password: "pw", otp: "123456" })
    ).data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "turnstileFailed" })
    expect(loginLimiter.consume).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("rejects a marker signed with another secret", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_OTP"))
    )
    await login({
      email: "staff@example.com",
      password: "pw",
      captcha: "good-token",
    })

    vi.stubEnv("TURNSTILE_SECRET_KEY", "rotated-secret")
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (
      await login({ email: "staff@example.com", password: "pw", otp: "123456" })
    ).data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "turnstileFailed" })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("rejects the marker of another email", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_OTP"))
    )
    await login({
      email: "staff@example.com",
      password: "pw",
      captcha: "good-token",
    })

    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (
      await login({ email: "other@example.com", password: "pw", otp: "123456" })
    ).data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "turnstileFailed" })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("never issues the marker on invalid credentials", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret")
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const jar = makeJar()
    wireRequest(jar)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => directusError("INVALID_CREDENTIALS"))
    )

    const result = (
      await login({
        email: "staff@example.com",
        password: "pw",
        captcha: "good-token",
      })
    ).data as { ok: false; message: string }

    expect(result).toEqual({ ok: false, message: "invalidCredentials" })
    expect(jar.jar.has(TURNSTILE_MARKER_COOKIE)).toBe(false)
    expect(jar.set).not.toHaveBeenCalled()
  })
})
