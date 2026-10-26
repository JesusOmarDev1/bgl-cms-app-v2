import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RecordBlockPage } from "@/components/page/BlockPage"
import { BlockPageSkeleton } from "@/components/page/BlockPageSkeleton"
import { getBlogPostBySlugRepository } from "@/services/domain/db/repositories/collections/blog-posts"
import { metadata as createMetadata } from "@/lib/seo/metadata"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await getBlogPostBySlugRepository({ slug })
  const post = posts[0]
  if (!post) notFound()
  return createMetadata({
    title: post.title,
    description: post.excerpt ?? "",
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "",
      type: "website",
    },
  })
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<BlockPageSkeleton />}>
      <RecordBlockPage params={params} load={getBlogPostBySlugRepository} />
    </Suspense>
  )
}
