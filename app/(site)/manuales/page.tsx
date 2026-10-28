import { Suspense } from "react"
import type { Metadata } from "next"
import { connection } from "next/server"
import { getTranslations } from "next-intl/server"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { CatalogBodySkeleton } from "@/components/collections/catalog/CatalogBodySkeleton"
import { CatalogToolBarSkeleton } from "@/components/collections/catalog/CatalogToolBarSkeleton"
import type { CatalogLabels } from "@/components/collections/catalog/CatalogToolBarClient"
import { ManualCatalogClients } from "@/components/collections/manuals/ManualCatalogClients"
import type { ManualCardData } from "@/components/collections/manuals/ManualCard"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { GoBackBtn } from "@/components/shared/content/GoBackBtn"
import { WEBSITE_URL } from "@/lib/env/constants"
import { sanitizeHtml } from "@/lib/formatting/sanitize"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import type { ManualsQueryResult } from "@/services/domain/db/queries/collections/manuals/manuals"
import {
  getManualsCountRepository,
  getManualsRepository,
} from "@/services/domain/db/repositories/collections/manuals"

function trimmed(value: string | null | undefined): string | null {
  const next = value?.trim()
  return next ? next : null
}

function cleanExcerpt(value: string | null): string | null {
  if (!value) return null
  const sanitized = sanitizeHtml(value)
  return sanitized.trim().length > 0 ? sanitized : null
}

function toManualCard(row: ManualsQueryResult[number]): ManualCardData {
  return {
    id: row.id,
    title: row.title,
    excerpt: cleanExcerpt(row.excerpt),
    description: null,
    dateCreated: row.date_created,
    categorySlug: trimmed(row.manual_category?.slug),
    categoryTitle: trimmed(row.manual_category?.title),
    slug: trimmed(row.slug),
    imageId: row.image?.id ?? null,
  }
}

async function loadManuals(): Promise<ManualsQueryResult> {
  const count = await getManualsCountRepository()
  if (count <= 0) return []
  return getManualsRepository({ limit: count })
}

async function ManualCatalog({
  manuals,
  labels,
  emptyCatalog,
  noMatches,
  clearLabel,
}: {
  manuals: Promise<ManualsQueryResult>
  labels: CatalogLabels
  emptyCatalog: string
  noMatches: string
  clearLabel: string
}) {
  const rows = await manuals
  await connection()
  const items = rows.map((row) => toManualCard(row))

  return (
    <ManualCatalogClients
      clearLabel={clearLabel}
      emptyCatalog={emptyCatalog}
      items={items}
      labels={labels}
      noMatches={noMatches}
    />
  )
}

async function Catalog() {
  const manuals = loadManuals()
  const t = await getTranslations("manuals")
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
          <ManualCatalog
            clearLabel={labels.clear}
            emptyCatalog={t("empty_catalog")}
            labels={labels}
            manuals={manuals}
            noMatches={t("no_matches")}
          />
        </Suspense>
      </Box>
    </BoxContainer>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("manuals")
  const canonical = `${WEBSITE_URL}/manuales`
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
