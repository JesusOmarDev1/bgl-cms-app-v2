import type { CommandItem } from "@/components/shared/content/CommandPalette"
import { COLLECTION_LABELS } from "@/types/shared/search/collection-labels"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"

export function toSearchCommandItem(
  hit: SearchHitTypes
): Omit<CommandItem, "onSelect"> | null {
  if (hit.url.length === 0) return null

  return {
    id: `${hit.collection}:${hit.id}`,
    label: hit.title,
    group: COLLECTION_LABELS[hit.collection] ?? hit.collection,
    description: hit.excerpt,
    image: hit.image,
  }
}
