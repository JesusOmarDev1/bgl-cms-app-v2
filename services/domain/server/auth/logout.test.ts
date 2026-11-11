import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => `T:${key}`),
}))
vi.mock("@/lib/env/constants", () => ({
  DIRECTUS_URL: "https://directus.test",
  DIRECTUS_STATIC_TOKEN: "public-site-token",
  DIRECTUS_LOG_LEVEL: undefined,
}))

import { cookies, headers } from "next/headers"
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/services/domain/server/auth/token"
import { logout } from "@/services/domain/server/auth/logout"

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

const givenCookies = () => {
  store.get.mockImplementation((name: string) =>
    name === AUTH_ACCESS_COOKIE
      ? { name: AUTH_ACCESS_COOKIE, value: "access-old" }
      : name === AUTH_REFRESH_COOKIE
        ? { name: AUTH_REFRESH_COOKIE, value: "refresh-old" }
        : undefined
  )
  vi.mocked(cookies).mockResolvedValue(store as never)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("logout server action", () => {
  it("invalidates the refresh token in Directus before clearing cookies", async () => {
    givenCookies()
    const calls: Request[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: unknown, init?: RequestInit) => {
        calls.push(new Request(_input as string, init))
        return Promise.resolve(new Response(null, { status: 204 }))
      })
    )

    await expect(logout({} as never)).resolves.toEqual({
      data: { ok: true, remoteRevoked: true },
    })

    expect(calls).toHaveLength(1)
    expect(new URL(calls[0].url).pathname).toBe("/auth/logout")
    expect(await calls[0].json()).toEqual({
      mode: "json",
      refresh_token: "refresh-old",
    })
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
    expect(store.set).not.toHaveBeenCalled()
  })

  it("still clears cookies locally while refusing to confirm remote revocation", async () => {
    givenCookies()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed")
      })
    )

    await expect(logout({} as never)).resolves.toEqual({
      data: { ok: true, remoteRevoked: false },
    })
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
  })

  it("reports an unknown session without touching Directus", async () => {
    store.get.mockImplementation(() => undefined)
    vi.mocked(cookies).mockResolvedValue(store as never)
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = (await logout({} as never)).data as {
      ok: boolean
      message?: string
    }

    expect(result.ok).toBe(false)
    expect(result.message).toBe("sessionExpired")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.delete).toHaveBeenCalledWith(AUTH_ACCESS_COOKIE)
    expect(store.delete).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE)
  })
})
