import { connection } from "next/server"
import { notFound } from "next/navigation"
import { RenderBlocks, type BlockBody } from "@/components/blocks/RenderBlocks"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { getPageBySlugRepository } from "@/services/domain/db/repositories/collections/pages"

type BlockPageProps = {
  slug?: string
  params?: Promise<{ slug: string }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isOverlayHero(body: unknown): boolean {
  if (!Array.isArray(body)) return false
  const row = body[0]
  if (!isRecord(row) || row.collection !== "hero_block") return false
  if (!isRecord(row.item)) return false
  return (
    row.item.variant === "carousel" ||
    row.item.variant === "carousel_with_logos"
  )
}

function expectOverlay(body: unknown, expected: boolean) {
  if (isOverlayHero(body) !== expected) {
    throw new Error("overlay hero self-check failed")
  }
}

function isBlockRow(
  value: unknown
): value is { id: number; collection: string; item: unknown } {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.collection === "string" &&
    "item" in value
  )
}

function toBlockBody(value: unknown): BlockBody {
  if (!Array.isArray(value)) return null
  const rows: { id: number; collection: string; item: unknown }[] = []
  for (const entry of value) {
    if (isBlockRow(entry)) rows.push(entry)
  }
  return rows
}

function expectBlockBody(value: unknown, count: number) {
  const body = toBlockBody(value)
  if ((body?.length ?? 0) !== count) {
    throw new Error("block body self-check failed")
  }
}

expectOverlay(undefined, false)
expectOverlay([4], false)
expectOverlay([{ collection: "hero_block", item: "uuid" }], false)
expectOverlay(
  [{ collection: "faq_block", item: { variant: "carousel" } }],
  false
)
expectOverlay(
  [{ collection: "hero_block", item: { variant: "simple" } }],
  false
)
expectOverlay(
  [{ collection: "hero_block", item: { variant: "carousel" } }],
  true
)
expectOverlay(
  [{ collection: "hero_block", item: { variant: "carousel_with_logos" } }],
  true
)
expectBlockBody(undefined, 0)
expectBlockBody([4], 0)
expectBlockBody([{ collection: "hero_block", item: {} }], 0)
expectBlockBody(
  [{ id: 1, collection: "hero_block", item: { variant: "simple" } }],
  1
)

export function BlockPageShell({ body }: { body: BlockBody }) {
  return (
    <>
      {isOverlayHero(body) ? null : <HeaderSpacer />}
      <RenderBlocks blocks={body} />
    </>
  )
}

export async function RecordBlockPage({
  slug,
  params,
  load,
}: BlockPageProps & {
  load: (args: { slug: string }) => Promise<readonly { body: unknown }[]>
}) {
  let resolved = slug
  if (!resolved && params) {
    resolved = (await params).slug
  }
  if (!resolved) notFound()

  const rows = await load({ slug: resolved })
  const row = rows[0]
  if (!row) notFound()

  const body = toBlockBody(row.body)
  // DOMPurify reads the clock while sanitizing CMS HTML. Postpone that render.
  await connection()

  return <BlockPageShell body={body} />
}
