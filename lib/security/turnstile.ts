import "server-only"

import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile"
import {
  TURNSTILE_FORM_ACTION,
  TURNSTILE_SECRET_KEY,
  TURNSTILE_VERIFY_URL,
} from "@/lib/env/constants"

function isTurnstileSuccess(
  value: unknown,
  action: string
): value is TurnstileServerValidationResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true &&
    "action" in value &&
    value.action === action
  )
}

export async function verifyTurnstile(
  token: string,
  action: string = TURNSTILE_FORM_ACTION
): Promise<boolean> {
  const secret = TURNSTILE_SECRET_KEY
  const url = TURNSTILE_VERIFY_URL
  const responseToken = token.trim()
  if (!secret || !url || responseToken === "") return false

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: responseToken }),
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return false
    const payload: unknown = await response.json()
    return isTurnstileSuccess(payload, action)
  } catch {
    return false
  }
}
