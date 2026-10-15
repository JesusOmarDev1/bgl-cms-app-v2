import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { metadataFromPage } from "@/lib/seo/metadata"
import { getPageBySlugRepository } from "@/services/domain/db/repositories/collections/pages"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pages = await getPageBySlugRepository({ slug })
  const page = pages[0]
  if (!page) notFound()
  return metadataFromPage(page, slug)
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <BlockPage params={params} />
    </Suspense>
  )
}
