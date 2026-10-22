import type { MetadataRoute } from "next"
import { sitemapRegistry } from "@/config/sitemap"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? ""
  return {
    rules: {
      userAgent: "*",
      allow: "*",
      disallow: [
        "/debug",
        "/dashboard",
        "/api",
        "/_next",
        "/_static",
        "/maintenance",
        "/health",
      ],
    },
    sitemap: Object.values(sitemapRegistry).map(
      (source) => `${baseUrl}/sitemap/${source.prefix}.xml`
    ),
  }
}
