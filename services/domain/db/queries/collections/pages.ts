import "server-only"
import directus from "@/config/directus"
import { StatusType } from "@/types/enums/status-type"
import { readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import { PagesTypes } from "@/types/collections/pages"

export interface PagesQuery {
  status?: StatusType
  limit?: number
  offset?: number
}

export async function getPagesQuery(query: PagesQuery): Promise<PagesTypes[]> {
  const { status = "published", limit = 10, offset = 0 } = query
  const t = await getTranslations("db")

  try {
    const pages = await directus.request<PagesTypes[]>(
      readItems("pages", {
        fields: ["*"],
        limit: limit,
        offset: offset,
        sort: "-date_created",
        filter: { status: { _eq: status } },
      })
    )
    return pages
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : t("pages.failed_to_fetch")
    )
    return []
  }
}

export async function getPagesBySlugQuery(
  query: PagesQuery,
  slug: string
): Promise<PagesTypes[]> {
  const { status = "published", limit = 1, offset = 0 } = query
  const t = await getTranslations("db")

  try {
    const page = await directus.request<PagesTypes[]>(
      readItems("pages", {
        fields: ["*"],
        limit: limit,
        offset: offset,
        sort: "-date_created",
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      })
    )
    return page
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : t("pages.failed_to_fetch")
    )
    return []
  }
}
