import Fuse, { type FuseOptionKey } from "fuse.js"
import { useTranslations } from "next-intl"

export interface FuseSearchOptions<T> {
  keys: FuseOptionKey<T>[]
  threshold?: number
  distance?: number
  minMatchCharLength?: number
  ignoreLocation?: boolean
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: FuseSearchOptions<T>
) {
  const t = useTranslations("search")

  if (!query.trim()) return items

  const fuse = new Fuse(items, {
    ...options,
    keys: options.keys,
    threshold: options.threshold ?? 0.3,
    distance: options.distance ?? 100,
    ignoreLocation: options.ignoreLocation ?? true,
    minMatchCharLength: options.minMatchCharLength ?? 2,
    includeScore: true,
  })

  try {
    return fuse.search(query).map((result) => result.item as T)
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("unknown_error"))
    return items
  }
}
