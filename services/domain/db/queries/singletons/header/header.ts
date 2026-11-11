import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { cacheLife, cacheTag } from "next/cache"

import { publicDirectus } from "@/config/directus-public"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { HEADER_FIELDS } from "@/services/domain/db/queries/singletons/header/header.fields"
import type { Schema } from "@/types/schema"
import type { HeaderType } from "@/types/singletons/header"

async function fetchHeader() {
  "use cache"
  cacheTag("header")
  cacheLife("hours")
  return publicDirectus.request(
    readSingleton("header", {
      fields: HEADER_FIELDS,
    } satisfies Query<Schema, HeaderType>)
  )
}

export async function getHeaderQuery(failedToFetchMessage: string) {
  try {
    return await fetchHeader()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getHeaderQuery",
      collection: "header",
    })
    return null
  }
}

export type HeaderQueryResult = Awaited<ReturnType<typeof getHeaderQuery>>
