import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RecordBlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { getPageBySlugRepository } from "@/services/domain/db/repositories/collections/pages"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { getManualBySlugRepository } from "@/services/domain/db/repositories/collections/manuals"

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

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <RecordBlockPage params={params} load={getPageBySlugRepository} />
    </Suspense>
  )
}
