"use server"

import { headers } from "next/headers"
import * as v from "valibot"
import { isDirectusError, readMe } from "@directus/sdk"
import { actionClient } from "@/lib/server/safe-action"
import { loginLimiter } from "@/config/rate-limiter"
import { createDirectusAuthClient } from "@/config/directus-private"
import { applyAuthCookies } from "@/services/domain/server/auth/token"

const loginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email(), v.maxLength(256)),
  password: v.pipe(v.string(), v.minLength(1), v.maxLength(256)),
  otp: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(32))),
})

type LoginResult =
  { ok: true } | { ok: false; message: string; mfaRequired?: true }

export const login = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }): Promise<LoginResult> => {
    const { email, password, otp } = parsedInput

    const forwarded = (await headers()).get("x-forwarded-for")
    const clientIp = forwarded
      ?.trim()
      .toLowerCase()
      .replace(/^::ffff:/, "")
    if (!clientIp || clientIp.includes(",")) {
      return { ok: false, message: "unavailable" }
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
      const me = await client.request(readMe({ fields: ["id", "role"] }))
      if (!me.role) {
        return { ok: false, message: "noRole" }
      }
      await applyAuthCookies(auth)
      return { ok: true }
    } catch (error) {
      if (isDirectusError(error)) {
        const code = error.errors[0]?.extensions?.code
        if (code === "INVALID_CREDENTIALS") {
          return { ok: false, message: "invalidCredentials" }
        }
        if (code === "INVALID_OTP") {
          return {
            ok: false,
            message: otp ? "mfaInvalid" : "mfaRequired",
            mfaRequired: true,
          }
        }
        if (code === "REQUESTS_EXCEEDED") {
          return { ok: false, message: "rateLimited" }
        }
        return { ok: false, message: "generic" }
      }
      return { ok: false, message: "unavailable" }
    }
  })
