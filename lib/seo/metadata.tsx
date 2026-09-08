import type { Metadata } from "next"

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
        url: "/favicon.svg",
        width: "160",
        height: "160",
        alt: "Maintenance",
        type: "image/png",
      },
    ],
  },
  twitter: {
    title: twitter?.title ?? openGraph?.title ?? "",
    description: twitter?.description ?? openGraph?.description ?? "",
    card: twitter?.card ?? "summary_large_image",
    images: [
      {
        url: "/favicon.svg",
        width: "160",
        height: "160",
        alt: "Maintenance",
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
  },
  assets: [`${BASE_URL}/pwa`, `${BASE_URL}/static`],
})

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
