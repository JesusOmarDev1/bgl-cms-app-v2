import { connection } from "next/server"
import { notFound } from "next/navigation"
import { RenderBlocks } from "@/components/blocks/RenderBlocks"
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

export async function BlockPage({ slug, params }: BlockPageProps) {
  let resolved = slug
  if (!resolved && params) {
    resolved = (await params).slug
  }
  if (!resolved) notFound()

  const pages = await getPageBySlugRepository({ slug: resolved })
  const page = pages[0]
  if (!page) notFound()

  // DOMPurify reads the clock while sanitizing CMS HTML. Postpone that render.
  await connection()

  return (
    <>
      {isOverlayHero(page.body) ? null : <HeaderSpacer />}
      <RenderBlocks blocks={page.body} />
    </>
  )
}
