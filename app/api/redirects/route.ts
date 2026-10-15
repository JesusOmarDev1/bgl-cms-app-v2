import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"
import { getRedirectsQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

export async function GET(request: Request) {
  const origin = new URL(request.url).searchParams.get("origin")
  if (!origin) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "no-store" },
    })
  }

  const t = await getTranslations("db.redirects")
  const rows = await getRedirectsQuery(
    { origin, limit: 1, page: 1 },
    t("failed_to_fetch")
  )
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "no-store" },
  })
}
