import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

import { cookies } from "next/headers"
import {
  applyAuthCookies,
  clearAuthCookies,
  readAuthSession,
} from "@/services/domain/server/auth/token"

const store = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

const sessionCookie = (token: string) => ({
  name: token === "access-1" ? "bgl_auth_access" : "bgl_auth_refresh",
  value: token,
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("auth session DAL", () => {
  it("reads both session cookies only when both exist", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "bgl_auth_access"
          ? sessionCookie("access-1")
          : name === "bgl_auth_refresh"
            ? sessionCookie("refresh-1")
            : undefined,
    } as never)

    await expect(readAuthSession()).resolves.toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
    })
  })

  it("reads a refresh-cookie-only session after access expiry", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "bgl_auth_refresh" ? sessionCookie("refresh-1") : undefined,
    } as never)

    await expect(readAuthSession()).resolves.toEqual({
      accessToken: null,
      refreshToken: "refresh-1",
    })
  })

  it("reports no session when the refresh cookie is missing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "bgl_auth_access" ? sessionCookie("access-1") : undefined,
    } as never)

    await expect(readAuthSession()).resolves.toBeNull()
  })

  it("emits two HttpOnly same-origin cookies aligned with the Directus response", async () => {
    vi.mocked(cookies).mockResolvedValue(store as never)

    await applyAuthCookies({
      access_token: "access-1",
      refresh_token: "refresh-1",
      expires: 900_000,
      expires_at: null,
    })

    expect(store.set).toHaveBeenCalledTimes(2)
    expect(store.set).toHaveBeenCalledWith(
      "bgl_auth_access",
      "access-1",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 900,
      })
    )
    expect(store.set).toHaveBeenCalledWith(
      "bgl_auth_refresh",
      "refresh-1",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
      })
    )
    const options = vi.mocked(store.set).mock.calls[0][2] as Record<
      string,
      unknown
    >
    expect("domain" in options).toBe(false)
  })

  it("refuses to store an authentication response without both tokens", async () => {
    vi.mocked(cookies).mockResolvedValue(store as never)

    await expect(
      applyAuthCookies({
        access_token: "access-1",
        refresh_token: null,
        expires: 900_000,
        expires_at: null,
      })
    ).rejects.toThrow("missing tokens")
    expect(store.set).not.toHaveBeenCalled()
  })

  it("clears both cookies", async () => {
    vi.mocked(cookies).mockResolvedValue(store as never)

    await clearAuthCookies()

    expect(store.delete).toHaveBeenCalledTimes(2)
    expect(store.delete).toHaveBeenCalledWith("bgl_auth_access")
    expect(store.delete).toHaveBeenCalledWith("bgl_auth_refresh")
  })
})
