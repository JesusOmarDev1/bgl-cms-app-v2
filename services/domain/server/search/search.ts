"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { returnServerError } from "next-safe-action"
import * as v from "valibot"
import meilisearch from "@/config/meilisearch"
import { searchLimiter } from "@/config/rate-limiter"
import { actionClient } from "@/lib/server/safe-action"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"
import { TEXT_REGEX } from "@/lib/validations/text"

const searchSchema = v.object({
  query: v.pipe(
    v.string(),
    v.trim(),
    v.regex(TEXT_REGEX, "La consulta debe contener solo letras y números."),
    v.minLength(3, "La consulta debe tener al menos 3 caracteres válidos."),
    v.maxLength(
      100,
      "La consulta no puede tener más de 100 caracteres válidos."
    )
  ),
})

export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query } }) => {
    const t = await getTranslations("search")

    const forwarded = (await headers()).get("x-forwarded-for")
    const ip =
      forwarded
        ?.split(",")
        .at(-1)
        ?.trim()
        .toLowerCase()
        .replace(/^::ffff:/, "") || "missing"
    try {
      await searchLimiter.consume(ip)
    } catch {
      console.warn("[search] rate limited")
      returnServerError(t("rate_limited"))
    }

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
