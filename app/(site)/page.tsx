import { Suspense } from "react"
import { notFound } from "next/navigation"
import { BlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { metadataFromPage } from "@/lib/seo/metadata"
import { getPageBySlugRepository } from "@/services/domain/db/repositories/collections/pages"

const HOME_PAGE_SLUG = "inicio"

export async function generateMetadata() {
  const pages = await getPageBySlugRepository({ slug: HOME_PAGE_SLUG })
  const page = pages[0]
  if (!page) notFound()
  return metadataFromPage(page, HOME_PAGE_SLUG)
}

export default function Page() {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <BlockPage slug={HOME_PAGE_SLUG} />
    </Suspense>
  )
}
