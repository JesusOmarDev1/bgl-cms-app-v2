import { getRedirectIndexQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

const headers = { "Cache-Control": "no-store" }

export async function GET(request: Request) {
  const origin = new URL(request.url).searchParams.get("origin")
  const rows = await getRedirectIndexQuery(
    "Error al obtener las redirecciones.",
    origin
  )
  return Response.json(rows, { headers })
}
