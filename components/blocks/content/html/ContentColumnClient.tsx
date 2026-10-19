import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { contentPaddingToBox } from "@/lib/content/content-padding"
import type { ContentColumnQuery } from "@/services/domain/db/queries/blocks/content-column-block/content-column-block.fields"

export function ContentColumnClient({ data }: { data: ContentColumnQuery }) {
  const background =
    typeof data.background_color === "string"
      ? data.background_color.trim()
      : ""

  if (!data.content) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="article" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>
            Este contenido esta vacio o no esta disponible para mostrarlo,
            intentalo mas tarde.
          </EmptyTitle>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Box
      className={background ? "bg-transparent" : undefined}
      display="flex"
      gap={1}
      orientation="vertical"
      padding={contentPaddingToBox(data.padding)}
      paddingBottom={contentPaddingToBox(data.padding_bottom)}
      paddingInline={contentPaddingToBox(data.padding_inline)}
      paddingTop={contentPaddingToBox(data.padding_top)}
      style={background ? { backgroundColor: background } : undefined}
    >
      {data.content ? <SafeHtml content={data.content} /> : null}
    </Box>
  )
}
