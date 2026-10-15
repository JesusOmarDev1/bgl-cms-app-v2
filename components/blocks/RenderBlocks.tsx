import { Suspense, type ComponentType, type ReactElement } from "react"
import { blockRegistry } from "@/components/blocks/register"
import { Box } from "@/components/shared/content/Box"
import type {
  BodyBlockData,
  GlobalBodyBlockCollection,
} from "@/types/collections/junctions/body-blocks"

export type BodyRow = {
  id: number
  collection: string
  item: string | object | null
}

function isRegistryCollection(
  collection: string
): collection is GlobalBodyBlockCollection {
  return Object.hasOwn(blockRegistry, collection)
}

export function RenderBlocks({
  blocks,
}: {
  blocks: readonly (BodyRow | number)[] | null | undefined
}) {
  if (!blocks || blocks.length === 0) return null

  const nodes: ReactElement[] = []
  for (const row of blocks) {
    if (typeof row !== "object") continue
    if (
      !isRegistryCollection(row.collection) ||
      typeof row.item !== "object" ||
      row.item === null
    ) {
      continue
    }
    const { Component, Skeleton } = blockRegistry[row.collection]
    const View = Component as ComponentType<{
      data: BodyBlockData<GlobalBodyBlockCollection>
    }>
    nodes.push(
      <Suspense key={row.id} fallback={<Skeleton />}>
        <View data={row.item as BodyBlockData<GlobalBodyBlockCollection>} />
      </Suspense>
    )
  }

  if (nodes.length === 0) return null
  return (
    <Box
      className="w-full min-w-0"
      display="flex"
      gap={4}
      orientation="vertical"
    >
      {nodes}
    </Box>
  )
}
