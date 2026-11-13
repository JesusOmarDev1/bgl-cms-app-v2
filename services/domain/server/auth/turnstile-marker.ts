import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import type { cookies } from "next/headers"
import { TURNSTILE_SECRET_KEY } from "@/lib/env/constants"

/**
 * Proof-of-captcha marker. A Turnstile token is single use, so the only way to
 * not re-verify the challenge on the OTP step is for the server to remember the
 * pass: signed here, HttpOnly, and carrying the email hash instead of the email.
 */
export const TURNSTILE_MARKER_COOKIE = "bgl_login_ts"

/** Long enough for a slow OTP, short enough to die with the login attempt. */
const MARKER_TTL_SECONDS = 300

type CookieStore = Awaited<ReturnType<typeof cookies>>
type MarkerPayload = { exp: number; e: string }

function sign(payload: string): string {
  return createHmac("sha256", TURNSTILE_SECRET_KEY)
    .update(payload)
    .digest("base64url")
}

function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex")
}

function decode(payload: string): MarkerPayload | null {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    )
    if (typeof value !== "object" || value === null) return null
    const { exp, e } = value as Record<string, unknown>
    return typeof exp === "number" && typeof e === "string" ? { exp, e } : null
  } catch {
    return null
  }
}

/** Called only after a challenge passed and the credentials reached the OTP step. */
export function issueTurnstileMarker(store: CookieStore, email: string) {
  if (!TURNSTILE_SECRET_KEY) return
  const payload: MarkerPayload = {
    exp: Date.now() + MARKER_TTL_SECONDS * 1000,
    e: hashEmail(email),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url")
  store.set(TURNSTILE_MARKER_COOKIE, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MARKER_TTL_SECONDS,
  })
}

/** Fail-closed: any missing piece, bad signature, stale expiry or email mismatch is a no. */
export function hasValidTurnstileMarker(
  store: CookieStore,
  email: string
): boolean {
  const raw = store.get(TURNSTILE_MARKER_COOKIE)?.value
  if (!TURNSTILE_SECRET_KEY || !raw) return false

  const [payload, signature, ...extra] = raw.split(".")
  if (!payload || !signature || extra.length > 0) return false

  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return false
  }

  const marker = decode(payload)
  return (
    marker !== null && marker.exp > Date.now() && marker.e === hashEmail(email)
  )
}

export function clearTurnstileMarker(store: CookieStore) {
  store.delete(TURNSTILE_MARKER_COOKIE)
}
