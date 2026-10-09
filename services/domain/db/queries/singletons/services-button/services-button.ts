import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"

import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { SERVICES_BUTTON_FIELDS } from "@/services/domain/db/queries/singletons/services-button/services-button.fields"
import type { Schema } from "@/types/schema"
import type { ServicesButtonType } from "@/types/singletons/services-button"
import { cacheLife, cacheTag } from "next/cache"

export async function getServicesButtonQuery(failedToFetchMessage: string) {
  "use cache"
  cacheTag("services_button")
  cacheLife("hours")
  try {
    return await directus.request(
      readSingleton("services_button", {
        fields: SERVICES_BUTTON_FIELDS,
        deep: {
          services: {
            _filter: {
              item: {
                status: { _eq: "published" },
              },
            },
          },
        },
      } satisfies Query<Schema, ServicesButtonType>)
    )
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getServicesButtonQuery",
      collection: "services_button",
    })
    return null
  }
}

export type ServicesButtonQueryResult = Awaited<
  ReturnType<typeof getServicesButtonQuery>
>
