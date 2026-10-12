import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"

import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { FOOTER_FIELDS } from "@/services/domain/db/queries/singletons/footer/footer.fields"
import type { Schema } from "@/types/schema"
import type { FooterType } from "@/types/singletons/footer"
import { cacheLife, cacheTag } from "next/cache"

async function fetchFooter() {
  "use cache"
  cacheTag("footer")
  cacheLife("hours")
  return directus.request(
    readSingleton("footer", {
      fields: FOOTER_FIELDS,
    } satisfies Query<Schema, FooterType>)
  )
}

export async function getFooterQuery(failedToFetchMessage: string) {
  try {
    return await fetchFooter()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getFooterQuery",
      collection: "footer",
    })
    return null
  }
}

export type FooterQueryResult = Awaited<ReturnType<typeof getFooterQuery>>
