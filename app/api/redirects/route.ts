import { getRedirectsQuery } from "@/services/domain/db/queries/collections/redirects/redirects"

const headers = { "Cache-Control": "no-store" }
const failedToFetchMessage = "Error al obtener las redirecciones."

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.searchParams.get("origin")
  if (
    !origin ||
    !origin.startsWith("/") ||
    origin.startsWith("//") ||
    /[\\\\\u0000-\u001f\u007f]/.test(origin) ||
    /%(?![0-9a-f]{2})/i.test(origin)
  ) {
    return Response.json({ error: "Invalid origin." }, { status: 400, headers })
  }

  let parsedOrigin: URL
  try {
    parsedOrigin = new URL(origin, requestUrl)
  } catch {
    return Response.json({ error: "Invalid origin." }, { status: 400, headers })
  }
  if (
    parsedOrigin.origin !== requestUrl.origin ||
    parsedOrigin.pathname !== origin ||
    parsedOrigin.search ||
    parsedOrigin.hash
  ) {
    return Response.json({ error: "Invalid origin." }, { status: 400, headers })
  }

  try {
    const rows = []
    for (let page = 1; ; page++) {
      const batch = await getRedirectsQuery(
        { limit: 200, page, origin, throwOnError: true },
        failedToFetchMessage
      )
      rows.push(...batch)
      if (batch.length < 200) return Response.json(rows, { headers })
    }
  } catch {
    return Response.json(
      { error: "Redirects unavailable." },
      { status: 503, headers }
    )
  }
}
