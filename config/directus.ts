import { createDirectus, rest, staticToken } from "@directus/sdk"
import { ofetch } from "ofetch"
import ofetchMessages from "@/i18n/ofetch/es.json"
import { PagesTypes } from "@/types/collections/pages"

type Schema = {
  pages: PagesTypes[]
}

const ofetchInstance = ofetch.create({
  retry: 2,
  retryDelay: 200,
  timeout: 30000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504, 409, 425],
  credentials: "include" as RequestCredentials,
  onRequestError: (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : ofetchMessages.ofetch.request_error
    )
  },
  onResponseError: (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : ofetchMessages.ofetch.response_error
    )
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
