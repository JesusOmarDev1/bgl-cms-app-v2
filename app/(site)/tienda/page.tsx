import { Suspense } from "react"
import type { Metadata } from "next"
import { connection } from "next/server"
import { getTranslations } from "next-intl/server"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { CatalogBodySkeleton } from "@/components/collections/catalog/CatalogBodySkeleton"
import { CatalogToolBarSkeleton } from "@/components/collections/catalog/CatalogToolBarSkeleton"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { ProductCatalogClients } from "@/components/collections/products/ProductCatalogClients"
import { toProductCard } from "@/components/collections/products/to-product-card"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { GoBackBtn } from "@/components/shared/content/GoBackBtn"
import { WEBSITE_URL } from "@/lib/env/constants"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { getProductCatalogRepository } from "@/services/domain/db/repositories/collections/products"

async function ProductCatalog({
  products,
  labels,
  emptyCatalog,
  noMatches,
  clearLabel,
}: {
  products: ReturnType<typeof getProductCatalogRepository>
  labels: CatalogLabels
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  const { products: rows, categoryAncestors } = await products
  await connection()
  const items = rows.map((row) => {
    const card = toProductCard(row)
    return {
      ...card,
      categoryAncestors: row.product_category
        ? (categoryAncestors[row.product_category.id] ?? [])
        : [],
    }
  })

  return (
    <ProductCatalogClients
      clearLabel={clearLabel}
      emptyCatalog={emptyCatalog}
      items={items}
      labels={labels}
      noMatches={noMatches}
    />
  )
}

async function Catalog() {
  const products = getProductCatalogRepository()
  const t = await getTranslations("products")
  const catalog = await getTranslations("catalog")
  const labels: CatalogLabels = {
    category: {
      label: catalog("category_label"),
      placeholder: catalog("category_placeholder"),
      all: catalog("category_all"),
    },
    search: {
      label: t("search_label"),
      placeholder: t("search_placeholder"),
    },
    sort: {
      label: catalog("sort_label"),
      newest: catalog("sort_newest"),
      oldest: catalog("sort_oldest"),
      az: catalog("sort_az"),
      za: catalog("sort_za"),
    },
    clear: catalog("clear_filters"),
  }

  return (
    <BoxContainer>
      <Box
        display="flex"
        gap={1.5}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={2}
      >
        <GoBackBtn href="/">{t("back_home")}</GoBackBtn>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-prose text-muted-foreground">{t("intro")}</p>
        <Suspense
          fallback={
            <>
              <CatalogToolBarSkeleton />
              <CatalogBodySkeleton />
            </>
          }
        >
          <ProductCatalog
            clearLabel={labels.clear}
            emptyCatalog={t("empty_catalog")}
            labels={labels}
            noMatches={t("no_matches")}
            products={products}
          />
        </Suspense>
      </Box>
    </BoxContainer>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products")
  const canonical = `${WEBSITE_URL}/tienda`
  return createMetadata({
    title: t("title"),
    description: t("intro"),
    canonical,
    openGraph: {
      title: t("title"),
      description: t("intro"),
      type: "website",
      url: canonical,
    },
  })
}

export default function Page() {
  return (
    <>
      <HeaderSpacer />
      <Catalog />
    </>
  )
}
