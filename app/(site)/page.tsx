import { Suspense } from "react"
import { notFound } from "next/navigation"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { getPageBySlugRepository } from "@/services/domain/db/repositories/collections/pages"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { RecordBlockPage } from "@/components/page/BlockPage"

const HOME_PAGE_SLUG = "inicio"

export async function generateMetadata() {
  const pages = await getPageBySlugRepository({ slug: HOME_PAGE_SLUG })
  const page = pages[0]
  if (!page) notFound()
  return createMetadata({
    title: page.title,
    description: page.excerpt ?? "",
    openGraph: {
      title: page.title,
      description: page.excerpt ?? "",
      type: "website",
    },
  })
}

export default function Page() {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <RecordBlockPage
        params={Promise.resolve({ slug: HOME_PAGE_SLUG })}
        load={getPageBySlugRepository}
      />
    </Suspense>
  )
}
