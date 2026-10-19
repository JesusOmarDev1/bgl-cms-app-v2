"use client"
import dynamic from "next/dynamic"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DirectusFileQuery } from "@/services/domain/db/queries/blocks/directus-file/directus-file.fields"
import type { MediaBlockQuery } from "@/services/domain/db/queries/blocks/media-block/media-block.fields"

const ImageViewerClient = dynamic(() => import("./ImageViewerClient"), {
  loading: () => (
    <Card aria-hidden="true">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="size-[100px]" />
      </CardContent>
      <CardFooter />
    </Card>
  ),
})
const VideoViewerClient = dynamic(() => import("./VideoViewerClient"), {
  loading: () => (
    <Skeleton
      aria-hidden="true"
      className="aspect-video w-full max-w-7xl min-w-0 rounded-2xl"
    />
  ),
})
const AudioViewerClient = dynamic(() => import("./AudioViewerClient"), {
  loading: () => (
    <Card aria-hidden="true" className="px-2 py-4">
      <CardContent className="px-2" />
      <CardFooter />
    </Card>
  ),
})
const PdfViewerClient = dynamic(() => import("./PdfViewerClient"), {
  loading: () => (
    <Card aria-hidden="true">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-150 w-full rounded-md" />
      </CardContent>
      <CardFooter />
    </Card>
  ),
})
const MultipleFilesViewerClient = dynamic(
  () => import("./MultipleFilesViewerClient"),
  {
    loading: () => (
      <Card aria-hidden="true">
        <CardContent className="flex flex-col flex-wrap gap-4" />
        <CardFooter />
      </Card>
    ),
  }
)

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
