import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RecordBlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { getServiceBySlugRepository } from "@/services/domain/db/repositories/collections/services"
import { metadata as createMetadata } from "@/lib/seo/metadata"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const services = await getServiceBySlugRepository({ slug })
  const service = services[0]
  if (!service) notFound()
  return createMetadata({
    title: service.title,
    description: service.excerpt ?? "",
    openGraph: {
      title: service.title,
      description: service.excerpt ?? "",
      type: "website",
    },
  })
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <RecordBlockPage params={params} load={getServiceBySlugRepository} />
    </Suspense>
  )
}
