import { getRedirectIndexQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

const headers = { "Cache-Control": "no-store" }

<<<<<<< HEAD
export async function GET() {
  const rows = await getRedirectIndexQuery(
    "Error al obtener las redirecciones."
=======
export async function GET(request: Request) {
  const origin = new URL(request.url).searchParams.get("origin")
  const rows = await getRedirectIndexQuery(
    "Error al obtener las redirecciones.",
    origin
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  )
  return Response.json(rows, { headers })
}
