import { getRedirectIndexQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

const headers = { "Cache-Control": "no-store" }

export async function GET() {
  const rows = await getRedirectIndexQuery(
    "Error al obtener las redirecciones."
  )
  return Response.json(rows, { headers })
}
