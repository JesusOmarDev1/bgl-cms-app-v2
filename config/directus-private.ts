import "server-only"

import { authentication, createDirectus, rest } from "@directus/sdk"
import { DIRECTUS_URL } from "@/lib/env/constants"
import { createDirectusTraceFetch } from "@/lib/directus/request-trace"
import type { Schema } from "@/types/schema"

const DIRECTUS_TIMEOUT_MS = 10_000

if (!DIRECTUS_URL) {
  throw new Error("You must set API credentials in the environment variables")
}

function buildPrivateClient() {
  return createDirectus<Schema>(DIRECTUS_URL, {
    globals: { fetch: createDirectusTraceFetch(fetch) },
  })
    .with(authentication("json", { autoRefresh: false }))
    .with(
      rest({
        onRequest: (options) => ({
          ...options,
          cache: "no-store",
          signal: AbortSignal.timeout(DIRECTUS_TIMEOUT_MS),
        }),
      })
    )
}

export function createDirectusAuthClient() {
  return buildPrivateClient()
}

export async function createPrivateDirectus(accessToken: string) {
  if (!accessToken.trim()) throw new Error("Missing employee token")

  const privateDirectus = buildPrivateClient()

  await privateDirectus.setToken(accessToken)
  return privateDirectus
}
