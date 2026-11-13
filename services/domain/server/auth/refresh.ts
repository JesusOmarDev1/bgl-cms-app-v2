"use server"

import {
  refresh as refreshCommand,
  type AuthenticationData,
} from "@directus/sdk"
import * as v from "valibot"
import { actionClient } from "@/lib/server/safe-action"
import { createDirectusAuthClient } from "@/config/directus-private"
import { getDirectusCode } from "@/lib/directus/directus-error"
import {
  applyAuthCookies,
  clearAuthCookies,
  readAuthSession,
} from "@/services/domain/server/auth/token"

type Rotation = AuthenticationData | "expired" | "unavailable"
// Single-flight refresh is deliberate process-local coordination: concurrent
// callers wait on one upstream rotation instead of racing a single-use token.
// eslint-disable-next-line react-doctor/server-no-mutable-module-state
const pendingRefreshes = new Map<string, Promise<Rotation>>()

type RefreshResult = { ok: true } | { ok: false; message: string }

export const refresh = actionClient
  .inputSchema(v.optional(v.object({})))
  .action(async (): Promise<RefreshResult> => {
    const session = await readAuthSession()
    if (!session) {
      // No session known to the DAL: leave no stale cookies behind either.
      await clearAuthCookies()
      return { ok: false, message: "sessionExpired" }
    }

    const staleToken = session.refreshToken
    let shared = pendingRefreshes.get(staleToken)
    if (!shared) {
      shared = performRefresh(staleToken)
      pendingRefreshes.set(staleToken, shared)
      void shared.finally(() => pendingRefreshes.delete(staleToken))
    }
    // Every waiting request applies the rotated tokens in its own response:
    // the caller who ran the request alone must not be the only one keeping the session.
    const auth = await shared
    if (auth === "expired") return { ok: false, message: "sessionExpired" }
    if (auth === "unavailable") return { ok: false, message: "unavailable" }
    await applyAuthCookies(auth)
    return { ok: true }
  })

async function performRefresh(refreshToken: string): Promise<Rotation> {
  try {
    // Raw command: the auth() extension's refresh() reads its own storage and
    // ignores an explicit refresh_token; the endpoint requires the JSON body.
    const client = await createDirectusAuthClient()
    return await client.request(
      refreshCommand({ mode: "json", refresh_token: refreshToken })
    )
  } catch (error) {
    // Only a denied or dead session clears the cookies. A Directus outage
    // (5xx, rate limit, transport) is transient: keep the tokens so the browser retries.
    switch (getDirectusCode(error)) {
      case "TOKEN_EXPIRED":
      case "INVALID_TOKEN":
      case "USER_SUSPENDED":
        // Racing callers end up here too; the deletion is idempotent.
        await clearAuthCookies()
        return "expired"
      default:
        return "unavailable"
    }
  }
}
