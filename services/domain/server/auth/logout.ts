"use server"

import { logout as logoutCommand } from "@directus/sdk"
import * as v from "valibot"
import { actionClient } from "@/lib/server/safe-action"
import { createDirectusAuthClient } from "@/config/directus-private"
import {
  clearAuthCookies,
  readAuthSession,
} from "@/services/domain/server/auth/token"

type LogoutResult = { ok: true; remoteRevoked: boolean }

export const logout = actionClient
  .inputSchema(v.optional(v.object({})))
  .action(async (): Promise<LogoutResult | { ok: false; message: string }> => {
    const session = await readAuthSession()
    if (!session) {
      await clearAuthCookies()
      return { ok: false, message: "sessionExpired" }
    }

    let remoteRevoked = true
    try {
      const client = await createDirectusAuthClient()
      await client.request(
        logoutCommand({
          mode: "json",
          refresh_token: session.refreshToken,
        })
      )
    } catch {
      remoteRevoked = false
    }
    await clearAuthCookies()
    return { ok: true, remoteRevoked }
  })
