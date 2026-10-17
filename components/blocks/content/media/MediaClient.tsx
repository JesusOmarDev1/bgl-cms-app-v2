"use client"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import type { DirectusFileQuery } from "@/services/domain/db/queries/blocks/directus-file/directus-file.fields"
import type { MediaBlockQuery } from "@/services/domain/db/queries/blocks/media-block/media-block.fields"
import AudioViewerClient from "./AudioViewerClient"
import ImageViewerClient from "./ImageViewerClient"
import MultipleFilesViewerClient from "./MultipleFilesViewerClient"
import PdfViewerClient from "./PdfViewerClient"
import VideoViewerClient from "./VideoViewerClient"

export default function MediaClient({ data }: { data: MediaBlockQuery }) {
  const files: DirectusFileQuery[] = []
  if (data.type === "multiple") {
    for (const row of data.files ?? []) {
      if (row.directus_files_id) files.push(row.directus_files_id)
    }
  }

  let viewer
  switch (data.type) {
    case "image":
      viewer = <ImageViewerClient data={data.image} />
      break
    case "video":
      viewer = <VideoViewerClient data={data.video} />
      break
    case "audio":
      viewer = <AudioViewerClient data={data.audio} />
      break
    case "pdf":
      viewer = <PdfViewerClient data={data.file} />
      break
    case "multiple":
      viewer = <MultipleFilesViewerClient data={files} />
      break
  }

  return (
    <Box display="flex" orientation="vertical" gap={2}>
      <h3>{data.title}</h3>
      <SafeHtml
        className="text-sm text-muted-foreground"
        content={data.excerpt || ""}
      />
      {viewer}
    </Box>
  )
}
