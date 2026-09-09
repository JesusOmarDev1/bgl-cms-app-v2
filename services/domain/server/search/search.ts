"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { z } from "zod"
import meilisearch from "@/config/meilisearch"
import { rateLimiter } from "@/config/rate-limiter"
import { actionClient } from "@/lib/server/safe-action"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"

const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, {
      message: "La consulta debe tener al menos 3 caracteres válidos.",
    })
    .max(100, {
      message: "La consulta no puede tener más de 100 caracteres válidos.",
    }),
})

export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query } }) => {
    const t = await getTranslations("search")
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const ip = forwardedFor?.split(",")[0] || realIp || "IP desconocida"

    return await rateLimiter.consume(ip).then(async (result) => {
      if (result.consumedPoints === 0) throw new Error("Rate limit exceeded")

      try {
        const results = await meilisearch
          .index("global_search")
          .search<SearchHitTypes>(query, {
            offset: 0,
            limit: 10,
            attributesToHighlight: ["title", "excerpt"],
            attributesToRetrieve: [
              "id",
              "collection",
              "title",
              "excerpt",
              "slug",
              "url",
              "image",
            ],
          })

        return results.hits
      } catch (error) {
        console.error(error)
        throw new Error(t("unknown_error"), { cause: error })
      }
    })
  })
