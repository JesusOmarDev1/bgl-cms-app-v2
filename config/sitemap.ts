import type { MetadataRoute } from "next"
import { WEBSITE_URL as BASE_URL } from "@/lib/env/constants"
import { getBlogPostsRepository } from "@/services/domain/db/repositories/collections/blog-posts"
import { getManualsRepository } from "@/services/domain/db/repositories/collections/manuals"
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
    entries: async () =>
      collectionEntries(await getPagesRepository({ limit: SITEMAP_LIMIT }), ""),
  },
  services: {
    prefix: "services",
    entries: async () =>
      collectionEntries(
        await getServicesRepository({ limit: SITEMAP_LIMIT }),
        "/servicios"
      ),
  },
  posts: {
    prefix: "blog",
    entries: async () =>
      collectionEntries(
        await getBlogPostsRepository({ limit: SITEMAP_LIMIT }),
        "/blog"
      ),
  },
  products: {
    prefix: "products",
    entries: async () =>
      collectionEntries(
        await getProductsRepository({ limit: SITEMAP_LIMIT }),
        "/tienda/producto"
      ),
  },
  manuals: {
    prefix: "manuals",
    entries: async () =>
      collectionEntries(
        await getManualsRepository({ limit: SITEMAP_LIMIT }),
        "/manuales"
      ),
  },
} satisfies Record<string, SitemapSource>
