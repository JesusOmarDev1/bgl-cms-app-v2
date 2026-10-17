import { Suspense, type ReactElement } from "react"
import { blockRegistry } from "@/components/blocks/register"
import { Box } from "@/components/shared/content/Box"
import type { PagesQueryResult } from "@/services/domain/db/queries/collections/pages/pages"

type PageBody = NonNullable<PagesQueryResult[number]["body"]>
type PageRow = PageBody[number]

function BlockSlot({ row }: { row: PageRow }) {
  const { Component, Skeleton } = blockRegistry[row.collection]
  // M2A rows are a discriminated union. Indexing the registry with that
  // union loses the collection/item pair, so the view is read back as the
  // row's own item instead of the schema block.
  const View = Component as (props: { data: PageRow["item"] }) => ReactElement
  return (
    <Suspense fallback={<Skeleton />}>
      <View data={row.item} />
    </Suspense>
  )
}

export function RenderBlocks({
  blocks,
}: {
  blocks: PageBody | null | undefined
}) {
  if (!blocks || blocks.length === 0) return null

  const nodes: ReactElement[] = []
  for (const row of blocks) {
    if (!Object.hasOwn(blockRegistry, row.collection)) continue
    nodes.push(<BlockSlot key={row.id} row={row} />)
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
