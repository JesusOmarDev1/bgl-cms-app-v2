import { getRedirectsQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

const headers = { "Cache-Control": "no-store" }

export async function GET(request: Request) {
  const origin = new URL(request.url).searchParams.get("origin")
  if (!origin) return Response.json([], { headers })
  const rows = await getRedirectsQuery(
    { origin, limit: 1, page: 1 },
    "Error al obtener las redirecciones."
  )
  return Response.json(rows, { headers })
}
