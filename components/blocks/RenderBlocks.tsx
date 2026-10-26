import { Suspense, type ReactElement } from "react"
import { blockRegistry } from "@/components/blocks/register"
import { Box } from "@/components/shared/content/Box"
import { sanitizeHtmlFields } from "@/lib/formatting/sanitize"

export type BlockBody =
  | readonly {
      id: number
      collection: string
      item: unknown
    }[]
  | null
  | undefined

type RegistryCollection = keyof typeof blockRegistry

function isRegistryCollection(
  collection: string
): collection is RegistryCollection {
  return Object.hasOwn(blockRegistry, collection)
}

if (
  !isRegistryCollection("hero_block") ||
  isRegistryCollection("not_a_block")
) {
  throw new Error("registry collection self-check failed")
}

function BlockSlot({
  collection,
  item,
}: {
  collection: RegistryCollection
  item: unknown
}) {
  const { Component, Skeleton } = blockRegistry[collection]
  // Indexing the registry with the collection union loses the item pair.
  const View = Component as (props: { data: unknown }) => ReactElement
  return (
    <Suspense fallback={<Skeleton />}>
      <View data={sanitizeHtmlFields(item)} />
    </Suspense>
  )
}

export function RenderBlocks({ blocks }: { blocks: BlockBody }) {
  if (!blocks || blocks.length === 0) return null

  const nodes: ReactElement[] = []
  for (const row of blocks) {
    if (!isRegistryCollection(row.collection)) continue
    nodes.push(
      <BlockSlot key={row.id} collection={row.collection} item={row.item} />
    )
  }

  if (nodes.length === 0) return null
  return (
    <Box
      className="w-full min-w-0"
      display="flex"
      gap={2}
      orientation="vertical"
    >
      {nodes}
    </Box>
  )
}
