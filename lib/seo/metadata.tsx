import type { Metadata } from "next"
import type { SeoTypes } from "@/types/collections/seo"

export interface MetadataProps {
  title: string
  description: string
  keywords?: string[]
  category?: string
  canonical?: string
  metadataBase?: URL | string
  robots?: {
    index?: boolean
    follow?: boolean
    googleBot?: {
      index?: boolean
      follow?: boolean
    }
  }
  openGraph: {
    title: string
    description: string
    type:
      | "website"
      | "article"
      | "book"
      | "profile"
      | "music.song"
      | "music.album"
      | "music.playlist"
      | "music.radio_station"
      | "video.movie"
      | "video.episode"
      | "video.tv_show"
      | "video.other"
    locale?: string
    siteName?: string
    url?: string
    images?: Array<{
      url: string
      width?: string
      height?: string
      alt?: string
      type?: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml"
    }>
  }
  twitter?: {
    title: string
    description: string
    card: "summary" | "summary_large_image"
    images?: Array<{
      url: string
      width?: string
      height?: string
      alt: string
      type: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml"
    }>
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? ""
const SITE_NAME = "BGL BASCULAS INDUSTRIALES"
const TITLE_TEMPLATE = `%s · ${SITE_NAME}`

export const metadata = ({
  title,
  description,
  keywords,
  category,
  robots,
  canonical,
  metadataBase,
  openGraph,
  twitter,
}: MetadataProps): Metadata => ({
  title: title || "Pagina sin titulo",
  metadataBase: metadataBase
    ? new URL(decodeURIComponent(String(metadataBase)))
    : new URL(decodeURIComponent(String(BASE_URL))),
  description: description ?? "Pagina sin descripcion",
  manifest: "/manifest.webmanifest",
  applicationName: SITE_NAME,
  keywords: keywords?.join(", ") ?? [],
  category: category ?? "Pagina sin categoria",
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
    capable: true,
  },
  creator: `${SITE_NAME} <soporte@bglbasculas.com>`,
  publisher: `${SITE_NAME} <soporte@bglbasculas.com>`,
  robots: {
    index: robots?.index ?? true,
    follow: robots?.follow ?? true,
    googleBot: {
      index: robots?.googleBot?.index ?? true,
      follow: robots?.googleBot?.follow ?? true,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.svg",
        sizes: "48x48",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: [
      {
        url: "/apple-image.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/apple-image.png",
        sizes: "180x180",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
  authors: [
    {
      name: SITE_NAME,
      url: BASE_URL,
    },
  ],
  alternates: {
    canonical: canonical ?? BASE_URL,
  },
  openGraph: {
    title: openGraph?.title ?? "",
    description: openGraph?.description ?? "",
    type: openGraph?.type ?? "website",
    locale: openGraph?.locale ?? "es_MX",
    siteName: openGraph?.siteName ?? SITE_NAME,
    url: openGraph?.url ?? BASE_URL,
    images: [
      {
        url: "/static/logo.png",
        alt: "BGL Básculas Industriales",
      },
    ],
  },
  twitter: {
    title: twitter?.title ?? openGraph?.title ?? "",
    description: twitter?.description ?? openGraph?.description ?? "",
    card: twitter?.card ?? "summary_large_image",
    images: [
      {
        url: "/static/logo.png",
        alt: "BGL Básculas Industriales",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#000000",
    HandheldFriendly: "true",
    MobileOptimized: "width",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "responsive-embedded-sizing": "allow-origins=*",
  },
  assets: [`${BASE_URL}/pwa`, `${BASE_URL}/static`],
})

function isSeoTypes(value: unknown): value is SeoTypes {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }
  if (!("title" in value) || typeof value.title !== "string") return false
  if (!("description" in value) || typeof value.description !== "string") {
    return false
  }
  return true
}

function keywordList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const words: string[] = []
  for (const item of value) {
    if (typeof item === "string" && item.trim()) words.push(item)
  }
  return words.length > 0 ? words : undefined
}

function pageCanonical(slug: string, canonical: string | null | undefined) {
  if (canonical && canonical.trim()) return canonical
  const base = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "").replace(/\/$/, "")
  const path = `/${slug}`
  return base ? `${base}${path}` : path
}

export function metadataFromPage(
  page: {
    title?: string | null
    excerpt?: string | null
    seo: unknown
  },
  slug: string
): Metadata {
  const seo = isSeoTypes(page.seo) ? page.seo : null
  const title = seo?.title.trim() || page.title?.trim() || "Inicio"
  const description = seo?.description.trim() || page.excerpt?.trim() || title
  const canonical = pageCanonical(slug, seo?.canonical)
  const noIndex = seo?.no_index === true
  const noFollow = seo?.no_follow === true

  return metadata({
    title,
    description,
    keywords: keywordList(seo?.keywords),
    canonical,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
  })
}

export function createRootMetadata(): Metadata {
  return {
    ...metadata({
      title: SITE_NAME,
      description: "Sitio web de BGL Básculas Industriales.",
      openGraph: {
        title: SITE_NAME,
        description: "Sitio web de BGL Básculas Industriales.",
        type: "website",
      },
    }),
    title: {
      default: SITE_NAME,
      template: TITLE_TEMPLATE,
    },
  }
}
