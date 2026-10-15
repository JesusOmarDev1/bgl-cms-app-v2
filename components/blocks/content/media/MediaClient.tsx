"use client"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import type { MediaBlock } from "@/types/blocks/content/media-block"
import type { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import AudioViewerClient from "./AudioViewerClient"
import ImageViewerClient from "./ImageViewerClient"
import MultipleFilesViewerClient from "./MultipleFilesViewerClient"
import PdfViewerClient from "./PdfViewerClient"
import VideoViewerClient from "./VideoViewerClient"

function expandedFile(
  value: string | DirectusFileTypes | null
): DirectusFileTypes | null {
  if (!value || typeof value === "string") return null
  return value
}

function expandedFiles(files: MediaBlock["files"]): DirectusFileTypes[] {
  const list: DirectusFileTypes[] = []
  for (const row of files) {
    if (typeof row === "number") continue
    const file = expandedFile(row.directus_files_id)
    if (file) list.push(file)
  }
  return list
}

function MediaByType({ data }: { data: MediaBlock }) {
  switch (data.type) {
    case "image":
      return <ImageViewerClient data={expandedFile(data.image)} />
    case "video":
      return <VideoViewerClient data={expandedFile(data.video)} />
    case "audio":
      return <AudioViewerClient data={expandedFile(data.audio)} />
    case "pdf":
      return <PdfViewerClient data={expandedFile(data.file)} />
    case "multiple":
      return <MultipleFilesViewerClient data={expandedFiles(data.files)} />
  }
}

export default function MediaClient({ data }: { data: MediaBlock }) {
  return (
    <Box display="flex" orientation="vertical" gap={2}>
      <h3>{data.title}</h3>
      <SafeHtml
        className="text-sm text-muted-foreground"
        content={data.excerpt || ""}
      />
      <MediaByType data={data} />
    </Box>
  )
}
