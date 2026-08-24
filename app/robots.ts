import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "*",
      disallow: ["/health", "/admin", "/client"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sitemap.xml`,
  }
}
