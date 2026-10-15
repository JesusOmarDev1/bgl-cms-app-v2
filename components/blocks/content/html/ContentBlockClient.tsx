import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import {
  expandedJunctions,
  isExpanded,
} from "@/components/blocks/directus-relation"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { contentPaddingToBox } from "@/lib/content/content-padding"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"
import type { ContentBlock } from "@/types/blocks/content/html/content-block"
import type { ContentBlockContentJunction } from "@/types/collections/junctions/content-block-content"
import { ContentColumnClient } from "./ContentColumnClient"

function columnCount(layout: ContentBlock["layout"]): 1 | 2 | 3 {
  if (layout === "two") return 2
  if (layout === "three") return 3
  return 1
}

function columns(content: ContentBlock["content"]): ContentColumnBlock[] {
  const list: ContentColumnBlock[] = []
  for (const row of expandedJunctions<ContentBlockContentJunction>(content)) {
    if (row.collection !== "content_column_block") continue
    if (!isExpanded(row.item)) continue
    list.push(row.item)
  }
  return list
}

export function ContentBlockClient({ data }: { data: ContentBlock }) {
  const items = columns(data.content)
  if (!data.title && items.length === 0) return null

  const count = columnCount(data.layout)
  const section = (
    <Box
      data-directus={setAttr({
        collection: "content_block",
        item: data.id,
        fields: "title,layout,padding,padding_top,padding_bottom,content",
        mode: "popover",
      })}
      display="flex"
      gap={2}
      orientation="vertical"
      padding={contentPaddingToBox(data.padding)}
      paddingBottom={contentPaddingToBox(data.padding_bottom)}
      paddingTop={contentPaddingToBox(data.padding_top)}
      render={(props) => <section {...props} />}
    >
      <BlockHeading title={data.title} />
      {items.length > 0 ? (
        <Box
          cols={count === 1 ? 1 : { base: 1, md: count }}
          display="grid"
          gap={2}
        >
          {items.map((column) => (
            <ContentColumnClient key={column.id} data={column} />
          ))}
        </Box>
      ) : null}
    </Box>
  )

  if (data.padding === "full_width") return section
  return <BoxContainer>{section}</BoxContainer>
}
