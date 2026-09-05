import type { Metadata } from "next"

export interface MetadataProps {
  title: {
    default: string
    template?: string
  }
  description: string
  keywords: string[]
  category?: string
  canonical?: string
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

export const metadata = ({
  title,
  description,
  keywords,
  category,
  canonical,
  openGraph,
  twitter,
}: MetadataProps): Metadata => ({
  title: {
    default: title.default ?? "Pagina sin titulo",
    template: "%s · BGL BASCULAS INDUSTRIALES",
  },
  description: description ?? "Pagina sin descripcion",
  manifest: "/manifest.webmanifest",
  applicationName: "BGL BASCULAS INDUSTRIALES",
  keywords: keywords?.join(", ") ?? [],
  category: category ?? "Pagina sin categoria",
  appleWebApp: true,
  creator: "BGL BASCULAS INDUSTRIALES <soporte@bglbasculas.com>",
  publisher: "BGL BASCULAS INDUSTRIALES <soporte@bglbasculas.com>",
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
      name: "BGL BASCULAS INDUSTRIALES",
      url: BASE_URL,
    },
  ],
  alternates: {
    canonical: canonical ?? BASE_URL,
  },
  openGraph: {
    title: openGraph.title,
    description: openGraph.description,
    type: openGraph.type,
    locale: openGraph.locale,
    siteName: openGraph.siteName,
    url: openGraph.url,
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
    title: twitter?.title ?? openGraph.title,
    description: twitter?.description ?? openGraph.description,
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
})
