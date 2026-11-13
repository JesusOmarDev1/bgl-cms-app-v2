import "server-only"

import { cookies } from "next/headers"
import type { AuthenticationData } from "@directus/sdk"

export const AUTH_ACCESS_COOKIE = "bgl_auth_access"
export const AUTH_REFRESH_COOKIE = "bgl_auth_refresh"

// shortcut: refresh cookie TTL must match Directus REFRESH_TOKEN_TTL in deployment; a shorter cookie only logs the user out earlier (fail-closed).
export const AUTH_REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

type AuthSession = {
  accessToken: string | null
  refreshToken: string
}

/** Reads the per-request session from Next-owned cookies; safe in renders and actions. */
export async function readAuthSession(): Promise<AuthSession | null> {
  const store = await cookies()
  const accessToken = store.get(AUTH_ACCESS_COOKIE)?.value
  const refreshToken = store.get(AUTH_REFRESH_COOKIE)?.value
  if (!refreshToken) return null
  return { accessToken: accessToken ?? null, refreshToken }
}

/**
 * Stores a Directus JSON authentication response in the own-origin cookies.
 * Only call from Server Actions or Route Handlers: HTTP forbids Set-Cookie
 * after a server render starts streaming, so this throws elsewhere.
 */
export async function applyAuthCookies(auth: AuthenticationData) {
  const accessToken = auth.access_token
  const refreshToken = auth.refresh_token
  if (!accessToken || !refreshToken) {
    throw new Error("Directus authentication response missing tokens")
  }
  const store = await cookies()
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  } as const
  store.set(AUTH_ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: auth.expires ? Math.floor(auth.expires / 1000) : undefined,
  })
  store.set(AUTH_REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: AUTH_REFRESH_COOKIE_MAX_AGE,
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(AUTH_ACCESS_COOKIE)
  store.delete(AUTH_REFRESH_COOKIE)
}
