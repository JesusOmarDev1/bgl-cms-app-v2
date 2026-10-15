import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { contentPaddingToBox } from "@/lib/content/content-padding"
import type { ContentColumnBlock } from "@/types/blocks/content/html/content-column-block"

export function ContentColumnClient({ data }: { data: ContentColumnBlock }) {
  const background =
    typeof data.background_color === "string"
      ? data.background_color.trim()
      : ""
  if (!data.title && !data.content && !background) return null

  return (
    <Box
      className={background ? "rounded-xl" : undefined}
      display="flex"
      gap={1}
      orientation="vertical"
      padding={contentPaddingToBox(data.padding)}
      paddingBottom={contentPaddingToBox(data.padding_bottom)}
      paddingTop={contentPaddingToBox(data.padding_top)}
      style={background ? { backgroundColor: background } : undefined}
    >
      {data.title ? <h3>{data.title}</h3> : null}
      {data.content ? <SafeHtml content={data.content} /> : null}
    </Box>
  )
}
