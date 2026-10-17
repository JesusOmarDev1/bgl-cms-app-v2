"use client"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import type { DirectusFileQuery } from "@/services/domain/db/queries/blocks/directus-file/directus-file.fields"
import { cn } from "cn"
import { VideoPlayer } from "@/components/shared/assets/video/VideoPlayer"
import { getAssetUrl } from "@/lib/directus/asset-url"

interface VideoViewerClientProps {
  data: DirectusFileQuery | null
  className?: string
  ambientBlur?: number
  ambientIntensity?: number
}

export default function VideoViewerClient({
  data,
  className,
  ambientBlur = 55,
  ambientIntensity = 0.65,
}: VideoViewerClientProps) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="video_camera_back" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el video</EmptyTitle>
          <EmptyDescription>El video que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="w-full max-w-7xl min-w-0 rounded-2xl">
      <VideoPlayer
        className={cn(className, "relative")}
        src={getAssetUrl(data?.id) || ""}
        title={data?.title ?? data?.filename_download ?? "Video"}
        ambientBlur={ambientBlur}
        ambientIntensity={ambientIntensity}
      />
    </div>
  )
}
