import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RecordBlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { getManualBySlugRepository } from "@/services/domain/db/repositories/collections/manuals"
import { metadata as createMetadata } from "@/lib/seo/metadata"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const manuals = await getManualBySlugRepository({ slug })
  const manual = manuals[0]
  if (!manual) notFound()
  return createMetadata({
    title: manual.title,
    description: manual.excerpt ?? "",
    openGraph: {
      title: manual.title,
      description: manual.excerpt ?? "",
      type: "website",
    },
  })
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <RecordBlockPage params={params} load={getManualBySlugRepository} />
    </Suspense>
  )
}
