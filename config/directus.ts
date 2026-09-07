import { createDirectus, rest, staticToken } from "@directus/sdk"
import { ofetch } from "ofetch"
import type { Schema } from "@/types/schema"

const ofetchInstance = ofetch.create({
  retry: 1,
  retryDelay: 200,
  timeout: 30000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504, 409, 425],
})

const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN! as string
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL! as string

if (!DIRECTUS_STATIC_TOKEN || !DIRECTUS_URL) {
  throw new Error("You must set API credentials in the environment variables")
}

const directus = createDirectus<Schema>(DIRECTUS_URL, {
  globals: { fetch: ofetchInstance },
})
  .with(staticToken(DIRECTUS_STATIC_TOKEN))
  .with(
    rest({
      credentials: "include",
    })
  )

export default directus
