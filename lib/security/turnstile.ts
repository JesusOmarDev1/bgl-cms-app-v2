import "server-only"

import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile"

function isTurnstileSuccess(
  value: unknown
): value is TurnstileServerValidationResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true
  )
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_SITEVERIFY_URL
  const responseToken = token.trim()
  if (!secret || !url || responseToken === "") return false

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: responseToken }),
    })
    if (!response.ok) return false
    const payload: unknown = await response.json()
    return isTurnstileSuccess(payload)
  } catch {
    return false
  }
}
