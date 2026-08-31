import "server-only"
import type { Query } from "@directus/sdk"
import { readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import type { PagesTypes } from "@/types/collections/pages"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface PagesQuery {
  status?: StatusType
  limit?: number
  offset?: number
}

const PAGES_FIELDS = [
  "*",
  {
    image: ["id", "title", "filename_download", "type", "width", "height"],
    seo: ["*"],
    body: [
      "id",
      "sort",
      "collection",
      {
        item: {
          faq_block: ["*"],
          map_block: ["*"],
          content_block: ["*"],
          cta_block: ["*"],
          form_block: ["*"],
          hero_block: ["*"],
          qr_code_block: ["*"],
          media_block: ["*"],
          carousel_block: ["*"],
          clients_block: ["*"],
          suppliers_block: ["*"],
          brands_block: ["*"],
          featured_services_block: ["*"],
          featured_products_block: ["*"],
          logos_clients_block: ["*"],
          division_services_block: ["*"],
        },
      },
    ],
  },
] as const

export async function getPagesQuery(query: PagesQuery) {
  const { status = "published", limit = 10, offset = 0 } = query
  const t = await getTranslations("db.pages")
  try {
    const pages = await directus.request(
      readItems("pages", {
        fields: PAGES_FIELDS,
        limit,
        offset,
        sort: "-date_created",
        filter: { status: { _eq: status } },
        deep: { body: { _sort: ["sort"] } },
      } satisfies Query<Schema, PagesTypes>)
    )
    return pages
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getPagesBySlugQuery(query: PagesQuery, slug: string) {
  const { status = "published", limit = 1, offset = 0 } = query
  const t = await getTranslations("db.pages")
  try {
    const page = await directus.request(
      readItems("pages", {
        fields: PAGES_FIELDS,
        limit,
        offset,
        sort: "-date_created",
        filter: { status: { _eq: status }, slug: { _eq: slug } },
        deep: { body: { _sort: ["sort"] } },
      } satisfies Query<Schema, PagesTypes>)
    )
    return page
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export type PagesQueryResult = Awaited<ReturnType<typeof getPagesQuery>>
