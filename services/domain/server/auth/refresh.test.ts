import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => `T:${key}`),
}))
vi.mock("@/lib/env/constants", () => ({
  DIRECTUS_URL: "https://directus.test",
  DIRECTUS_STATIC_TOKEN: "public-site-token",
  DIRECTUS_LOG_LEVEL: undefined,
}))

import { cookies } from "next/headers"
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  clearAuthCookies,
} from "@/services/domain/server/auth/token"
import { refresh } from "@/services/domain/server/auth/refresh"

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

const givenCookies = (withAccess = true) => {
  store.get.mockImplementation((name: string) =>
    name === AUTH_ACCESS_COOKIE && withAccess
      ? { name: AUTH_ACCESS_COOKIE, value: "access-old" }
      : name === AUTH_REFRESH_COOKIE
        ? { name: AUTH_REFRESH_COOKIE, value: "refresh-old" }
        : undefined
  )
  vi.mocked(cookies).mockResolvedValue(store as never)
}

const authRotated = {
  data: {
    access_token: "access-new",
    refresh_token: "refresh-new",
    expires: 900_000,
    expires_at: null,
  },
}

type FetchCall = { request: Request }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("refresh server action", () => {
  it("renews a refresh-cookie-only session after access expiry", async () => {
    givenCookies(false)
    const fetchSpy = vi.fn(async () => Response.json(authRotated))
    vi.stubGlobal("fetch", fetchSpy)

    const result = await refresh({} as never)

    expect(result.data).toEqual({ ok: true })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(store.set).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      "access-new",
      expect.objectContaining({ maxAge: 900, httpOnly: true })
    )
    expect(store.set).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE,
      "refresh-new",
      expect.objectContaining({ httpOnly: true })
    )
    expect(store.delete).not.toHaveBeenCalled()
  })

  it("sends one JSON-mode refresh per flight and rotates both cookies", async () => {
    givenCookies()
    const calls: FetchCall[] = []
    const finish: (() => void)[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: unknown, init?: RequestInit) => {
        return new Promise<Response>((resolve) => {
          const request = new Request(_input as string, init)
          calls.push({ request })
          finish.push(() => resolve(Response.json(authRotated)))
        })
      })
    )

    const a = refresh({} as never)
    const b = refresh({} as never)
    await vi.waitFor(() => expect(finish).toHaveLength(1))
    finish[0]()

    expect(await a).toStrictEqual({ data: { ok: true } })
    expect(await b).toStrictEqual({ data: { ok: true } })
    expect(calls).toHaveLength(1)
    expect(new URL(calls[0].request.url).pathname).toBe("/auth/refresh")
    expect(await calls[0].request.json()).toEqual({
      mode: "json",
      refresh_token: "refresh-old",
    })
    expect(store.set).toHaveBeenCalledWith(
      AUTH_ACCESS_COOKIE,
      "access-new",
      expect.objectContaining({ maxAge: 900, httpOnly: true })
    )
    expect(store.set).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE,
      "refresh-new",
      expect.objectContaining({ httpOnly: true })
    )
  })

  it("clears the session without retrying when the refresh token expired", async () => {
    givenCookies()
    const fetchSpy = vi.fn(async () =>
      Response.json(
        {
          errors: [
            { message: "redacted", extensions: { code: "TOKEN_EXPIRED" } },
          ],
        },
        { status: 401 }
      )
    )
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await refresh({} as never)).data as {
      ok: boolean
      message: string
    }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("sessionExpired")
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
    expect(store.set).not.toHaveBeenCalled()
  })

  it("clears a missing session without touching Directus", async () => {
    store.get.mockImplementation(() => undefined)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await refresh({} as never)).data as {
      ok: boolean
      message: string
    }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("sessionExpired")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
  })

  it("keeps cookies and reports unavailability on a Directus outage", async () => {
    givenCookies()
    const fetchSpy = vi.fn(async () =>
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
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await refresh({} as never)).data as {
      ok: boolean
      message: string
    }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("unavailable")
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(store.delete).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })

  it("keeps cookies and reports unavailability on transport failure", async () => {
    givenCookies()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed")
      })
    )

    const result = (await refresh({} as never)).data as {
      ok: boolean
      message: string
    }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("unavailable")
    expect(store.set).not.toHaveBeenCalled()
    expect(store.delete).not.toHaveBeenCalled()
  })
})

describe("clearAuthCookies coverage", () => {
  it("clears the coupled cookie list used by refresh failures", async () => {
    vi.mocked(cookies).mockResolvedValue(store as never)
    await clearAuthCookies()
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
  })
})
