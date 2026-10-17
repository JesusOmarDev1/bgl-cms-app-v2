import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { contentPaddingToBox } from "@/lib/content/content-padding"
import type { ContentBlockQuery } from "@/services/domain/db/queries/blocks/content-block/content-block.fields"
import { ContentColumnClient } from "./ContentColumnClient"

export function ContentBlockClient({ data }: { data: ContentBlockQuery }) {
  const columns = (data.content ?? []).filter((column) => column.item)
  const count = data.layout === "two" ? 2 : data.layout === "three" ? 3 : 1
  if (!data.title && columns.length === 0) return null

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
      {columns.length > 0 ? (
        <Box
          cols={count === 1 ? 1 : { base: 1, md: count }}
          display="grid"
          gap={2}
        >
          {columns.map((column) => (
            <ContentColumnClient key={column.id} data={column.item} />
          ))}
        </Box>
      ) : null}
    </Box>
  )

  if (data.padding === "full_width") return section
  return <BoxContainer>{section}</BoxContainer>
}
