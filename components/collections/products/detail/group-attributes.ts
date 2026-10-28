import type { ProductAttributeGroup } from "@/types/enums/product-attribute-group"

export const ATTRIBUTE_GROUP_ORDER = [
  "general",
  "specs",
  "functions",
  "others",
] as const satisfies readonly ProductAttributeGroup[]

export function groupAttributes<T extends { group: ProductAttributeGroup }>(
  items: readonly T[]
): { group: ProductAttributeGroup; items: T[] }[] {
  const buckets = new Map<ProductAttributeGroup, T[]>()
  for (const group of ATTRIBUTE_GROUP_ORDER) buckets.set(group, [])
  for (const item of items) buckets.get(item.group)?.push(item)
  return ATTRIBUTE_GROUP_ORDER.flatMap((group) => {
    const grouped = buckets.get(group) ?? []
    return grouped.length > 0 ? [{ group, items: grouped }] : []
  })
}

function expectGroupAttributes() {
  const grouped = groupAttributes([
    { group: "others" as const, id: "1" },
    { group: "general" as const, id: "2" },
    { group: "general" as const, id: "3" },
  ])
  const first = grouped[0]
  const second = grouped[1]
  if (
    grouped.length !== 2 ||
    first?.group !== "general" ||
    first.items.length !== 2 ||
    second?.group !== "others"
  ) {
    throw new Error("attribute group self-check failed")
  }
}

expectGroupAttributes()
