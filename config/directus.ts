import { createDirectus, rest, staticToken } from "@directus/sdk"
import { ofetch } from "ofetch"
import { getTranslations } from "next-intl/server"
import type { Schema } from "@/types/schema"

const t = await getTranslations("ofetch")

const ofetchInstance = ofetch.create({
  retry: 2,
  retryDelay: 200,
  timeout: 30000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504, 409, 425],
  credentials: "include" as RequestCredentials,
  onRequestError: (error) => {
    throw new Error(t("request_error"), { cause: error })
  },
  onResponseError: (response) => {
    throw new Error(t("response_error"), { cause: response })
  },
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
      onRequest: (options) => ({
        ...options,
        cache: "no-store" as RequestCache,
      }),
    })
  )

export default directus
