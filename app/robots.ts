import type { MetadataRoute } from "next"
import { sitemapRegistry } from "@/config/sitemap"
import { WEBSITE_URL } from "@/lib/env/constants"

export default function robots(): MetadataRoute.Robots {
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
      (source) => `${WEBSITE_URL}/sitemap/${source.prefix}.xml`
    ),
  }
}
