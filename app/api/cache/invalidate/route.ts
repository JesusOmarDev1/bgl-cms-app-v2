import "server-only"
import { createHash, timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { tagsForCollection } from "./collection-tags"

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

function secretsMatch(provided: string, expected: string) {
  const providedDigest = createHash("sha256").update(provided).digest()
  const expectedDigest = createHash("sha256").update(expected).digest()
  return timingSafeEqual(providedDigest, expectedDigest)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function POST(request: Request) {
  const expected = process.env.WEBHOOK_SECRET
  const provided = request.headers.get("x-webhook-secret")
  if (!expected || !provided || !secretsMatch(provided, expected)) {
    return json({ error: "unauthorized" }, 401)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: "invalid_body" }, 400)
  }

  if (
    !isRecord(body) ||
    typeof body.collection !== "string" ||
    body.collection.length === 0
  ) {
    return json({ error: "invalid_body" }, 400)
  }

  const tags = tagsForCollection(body.collection)
  if (!tags) return json({ error: "unknown_collection" }, 400)

  for (const tag of tags) revalidateTag(tag, "max")

  return json(
    {
      revalidated: true,
      collection: body.collection,
      tags: [...tags],
    },
    200
  )
}
