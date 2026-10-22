import type { MetadataRoute } from "next"
import { sitemapRegistry } from "@/config/sitemap"

export async function generateSitemaps(): Promise<{ id: string }[]> {
  return Object.values(sitemapRegistry).map((source) => ({
    id: source.prefix,
  }))
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const prefix = await props.id
  const source = Object.values(sitemapRegistry).find(
    (entry) => entry.prefix === prefix
  )
  if (!source) return []
  return source.entries()
}
