import { createDirectus, rest, staticToken } from "@directus/sdk"
import { ofetch } from "ofetch"
import type { Schema } from "@/types/schema"

const ofetchInstance = ofetch.create({
  retry: 1,
  retryDelay: 200,
  timeout: 30000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504, 409, 425],
})

const directus = createDirectus<Schema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL! as string,
  {
    globals: { fetch: ofetchInstance },
  }
)
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN! as string))
  .with(
    rest({
      credentials: "include",
    })
  )

export default directus
