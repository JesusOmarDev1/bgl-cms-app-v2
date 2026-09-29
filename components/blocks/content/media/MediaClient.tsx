"use client"
import { MediaBlockTypeEnum } from "@/types/enums/media-block-type"
import { Fragment } from "react/jsx-runtime"
import ImageViewerClient from "./ImageViewerClient"
import PdfViewerClient from "./PdfViewerClient"
import AudioViewerClient from "./AudioViewerClient"
import VideoViewerClient from "./VideoViewerClient"
import MultipleFilesViewerClient from "./MultipleFilesViewerClient"
import { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import { MediaBlock } from "@/types/blocks/content/media-block"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"

interface MediaClientProps {
  data: DirectusFileTypes
  block: MediaBlock
}

export default function MediaClient({ data, block }: MediaClientProps) {
  return (
    <Box display="flex" orientation="vertical" gap={2}>
      <h3>{block.title}</h3>
      <SafeHtml
        className="text-sm text-muted-foreground"
        content={block.excerpt || ""}
      />
      {MediaBlockTypeEnum.map((type) => (
        <Fragment key={type}>
          {type === "image" && <ImageViewerClient data={data} />}
          {type === "video" && <VideoViewerClient data={data} />}
          {type === "audio" && <AudioViewerClient data={data} />}
          {type === "pdf" && <PdfViewerClient data={data} />}
          {type === "multiple" && <MultipleFilesViewerClient data={[data]} />}
        </Fragment>
      ))}
    </Box>
  )
}
