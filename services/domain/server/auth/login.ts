"use server"

import { cookies, headers } from "next/headers"
import * as v from "valibot"
import { readMe } from "@directus/sdk"
import { actionClient } from "@/lib/server/safe-action"
import { verifyTurnstile } from "@/lib/security/turnstile"
import {
  TURNSTILE_LOGIN_ACTION,
  TURNSTILE_SECRET_KEY,
} from "@/lib/env/constants"
import { loginLimiter } from "@/config/rate-limiter"
import { createDirectusAuthClient } from "@/config/directus-private"
import { applyAuthCookies } from "@/services/domain/server/auth/token"
import {
  clearTurnstileMarker,
  hasValidTurnstileMarker,
  issueTurnstileMarker,
} from "@/services/domain/server/auth/turnstile-marker"
import {
  getDirectusCode,
  isTransportFailure,
} from "@/lib/directus/directus-error"

const loginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email(), v.maxLength(256)),
  password: v.pipe(v.string(), v.minLength(1), v.maxLength(256)),
  otp: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(32))),
  captcha: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(2048))),
})

type LoginResult =
  { ok: true } | { ok: false; message: string; mfaRequired?: true }

export const login = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }): Promise<LoginResult> => {
    const { email, password, otp, captcha } = parsedInput

    const forwarded = (await headers()).get("x-forwarded-for")
    const clientIp = forwarded
      ?.trim()
      .toLowerCase()
      .replace(/^::ffff:/, "")
    if (!clientIp || clientIp.includes(",")) {
      return { ok: false, message: "unavailable" }
    }
    // One challenge per login attempt: a submission without a fresh token passes
    // only on the marker issued after the challenge the user already solved.
    if (TURNSTILE_SECRET_KEY) {
      const passedChallenge = captcha
        ? await verifyTurnstile(captcha, TURNSTILE_LOGIN_ACTION)
        : hasValidTurnstileMarker(await cookies(), email)
      if (!passedChallenge) {
        return { ok: false, message: "turnstileFailed" }
      }
    }
    try {
      await loginLimiter.consume(clientIp)
    } catch {
      return { ok: false, message: "rateLimited" }
    }

    try {
      const client = await createDirectusAuthClient()
      const auth = await client.login(
        { email, password },
        { mode: "json", otp }
      )
      const me = await client.request(readMe({ fields: ["role"] }))
      if (!me.role) {
        return { ok: false, message: "noRole" }
      }
      await applyAuthCookies(auth)
      clearTurnstileMarker(await cookies())
      return { ok: true }
    } catch (error) {
      // No Directus answer at all is never a credential verdict.
      if (isTransportFailure(error)) {
        return { ok: false, message: "unavailable" }
      }
      switch (getDirectusCode(error)) {
        case "INVALID_CREDENTIALS":
          return { ok: false, message: "invalidCredentials" }
        case "INVALID_OTP":
          // Only a passed challenge plus valid credentials issues the marker,
          // so an OTP retry never needs a new one.
          if (!otp) await issueTurnstileMarker(await cookies(), email)
          return {
            ok: false,
            message: otp ? "mfaInvalid" : "mfaRequired",
            mfaRequired: true,
          }
        case "REQUESTS_EXCEEDED":
          return { ok: false, message: "rateLimited" }
        case "SERVICE_UNAVAILABLE":
          return { ok: false, message: "unavailable" }
        default:
          return { ok: false, message: "generic" }
      }
    }
  })
