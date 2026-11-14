import type { MetadataRoute } from "next"
import { WEBSITE_URL as BASE_URL } from "@/lib/env/constants"
import { getBlogPostsRepository } from "@/services/domain/db/repositories/collections/blog-posts"
import { getPagesRepository } from "@/services/domain/db/repositories/collections/pages"
import { getProductsRepository } from "@/services/domain/db/repositories/collections/products"
import { getServicesRepository } from "@/services/domain/db/repositories/collections/services"
import type { SeoFrequency } from "@/types/enums/seo-frequency"

const LEGAL_PATHS = [
  "/legal/terminos-de-uso-y-datos",
  "/legal/politicas-de-privacidad",
  "/legal/politicas-de-seguridad",
  "/legal/politicas-de-cookies",
] as const

const SITEMAP_LIMIT = 200

type SitemapSeo = {
  exclude?: boolean | null
  no_index?: boolean | null
  frecuency?: SeoFrequency | null
  priority?: number | null
  date_created?: string | null
  date_updated?: string | null
}

type SitemapRow = {
  slug?: string | null
  seo?: string | SitemapSeo | null
  date_created?: string | null
  date_updated?: string | null
}

type SitemapSource = {
  prefix: string
  entries: () => Promise<MetadataRoute.Sitemap>
}

function isIndexed(seo: SitemapSeo | undefined): boolean {
  if (seo?.exclude === true || seo?.no_index === true) return false
  return true
}

function collectionEntries(
  rows: readonly SitemapRow[],
  path: string
): MetadataRoute.Sitemap {
  const origin = BASE_URL
  const entries: MetadataRoute.Sitemap = []
  for (const row of rows) {
    const slug = row.slug
    if (typeof slug !== "string" || slug.length === 0 || slug.includes("/")) {
      continue
    }
    const seo = row.seo as SitemapSeo | undefined
    if (!isIndexed(seo)) continue
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${origin}${path}/${slug}`,
    }
    const modified =
      seo?.date_updated ??
      seo?.date_created ??
      row.date_updated ??
      row.date_created
    if (typeof modified === "string") entry.lastModified = modified
    if (seo?.frecuency) entry.changeFrequency = seo.frecuency
    const priority = seo?.priority
    if (typeof priority === "number" && priority >= 0 && priority <= 1) {
      entry.priority = priority
    }
    entries.push(entry)
  }
  return entries
}

async function allRows(
  fetchPage: (page: number) => Promise<readonly SitemapRow[]>
): Promise<SitemapRow[]> {
  const rows: SitemapRow[] = []
  for (let page = 1; ; page++) {
    const batch = await fetchPage(page)
    rows.push(...batch)
    if (batch.length < SITEMAP_LIMIT) return rows
  }
}

function staticEntries(): MetadataRoute.Sitemap {
  const origin = BASE_URL
  return LEGAL_PATHS.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))
}

export const sitemapRegistry = {
  static: {
    prefix: "static",
    entries: async () => staticEntries(),
  },
  pages: {
    prefix: "pages",
    entries: async () => {
      const rows = await allRows((page) =>
        getPagesRepository({ limit: SITEMAP_LIMIT, page })
      )
      return collectionEntries(
        rows.filter((row) => row.slug !== "manuales"),
        ""
      )
    },
  },
  services: {
    prefix: "services",
    entries: async () =>
      collectionEntries(
        await allRows((page) =>
          getServicesRepository({ limit: SITEMAP_LIMIT, page })
        ),
        "/servicios"
      ),
  },
  posts: {
    prefix: "blog",
    entries: async () =>
      collectionEntries(
        await allRows((page) =>
          getBlogPostsRepository({ limit: SITEMAP_LIMIT, page })
        ),
        "/blog"
      ),
  },
  products: {
    prefix: "products",
    entries: async () =>
      collectionEntries(
        await allRows((page) =>
          getProductsRepository({ limit: SITEMAP_LIMIT, page })
        ),
        "/tienda/producto"
      ),
  },
} satisfies Record<string, SitemapSource>
