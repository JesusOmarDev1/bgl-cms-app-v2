import "server-only"

import { createDirectus, rest, staticToken } from "@directus/sdk"
import { DIRECTUS_STATIC_TOKEN, DIRECTUS_URL } from "@/lib/env/constants"
import type { Schema } from "@/types/schema"

const DIRECTUS_TIMEOUT_MS = 10_000

if (!DIRECTUS_STATIC_TOKEN || !DIRECTUS_URL) {
  throw new Error("You must set API credentials in the environment variables")
}

const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_STATIC_TOKEN))
  .with(
    rest({
      onRequest: (options) => ({
        ...options,
        signal: AbortSignal.timeout(DIRECTUS_TIMEOUT_MS),
      }),
    })
  )

export default directus
