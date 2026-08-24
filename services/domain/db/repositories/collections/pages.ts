"use server"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PagesTypes } from "@/types/collections/pages"
import {
  PagesQuery,
  getPagesQuery,
  getPagesBySlugQuery,
} from "@/services/domain/db/queries/collections/pages"
import { useTranslations } from "next-intl"

export async function getPagesRepository({
  status = "published",
  limit = 10,
  offset = 0,
}: PagesQuery) {
  const t = useTranslations("db")
  return useSuspenseQuery<PagesTypes[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      try {
        const res = await getPagesQuery({ status, limit, offset })
        return res
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : t("pages.failed_to_fetch")
        )
        return []
      }
    },
  })
}

export async function getPageBySlugRepository({
  status = "published",
  limit = 1,
  offset = 0,
  slug,
}: PagesQuery & { slug: string }) {
  const t = useTranslations("db")
  return useSuspenseQuery<PagesTypes[]>({
    queryKey: ["page"],
    queryFn: async () => {
      try {
        const res = await getPagesBySlugQuery({ status, limit, offset }, slug)
        return res
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : t("pages.failed_to_fetch")
        )
        return []
      }
    },
  })
}
