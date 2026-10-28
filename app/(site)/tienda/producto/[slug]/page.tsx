import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { ProductDetail } from "@/components/collections/products/detail/ProductDetail"
import { ProductDetailSkeleton } from "@/components/collections/products/detail/ProductDetailSkeleton"
import { WEBSITE_URL } from "@/lib/env/constants"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { getProductBySlugRepository } from "@/services/domain/db/repositories/collections/products"
import type { ProductsQueryResult } from "@/services/domain/db/queries/collections/products/products"

type PageProps = {
  params: Promise<{ slug: string }>
}

function metaDescription(product: ProductsQueryResult[number]): string {
  const seo = product.seo
  if (seo && typeof seo === "object") {
    const description = seo.description.trim()
    if (description) return description
  }
  const excerpt = product.excerpt?.trim()
  if (excerpt) return excerpt
  return product.title
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const rows = await getProductBySlugRepository({ slug })
  const product = rows[0]
  if (!product) notFound()
  const description = metaDescription(product)
  const canonical = `${WEBSITE_URL}/tienda/producto/${slug}`
  return createMetadata({
    title: product.title,
    description,
    canonical,
    openGraph: {
      title: product.title,
      description,
      type: "website",
      url: canonical,
    },
  })
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <HeaderSpacer />
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </>
  )
}
