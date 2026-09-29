"use client"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getAssetUrl } from "@/lib/directus/asset-url"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { formatBytes } from "@/lib/formatting/format-bytes"
import { Track } from "@/lib/audio/html-audio"
import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerPlay,
  AudioPlayerSeekBar,
  AudioPlayerSkipBack,
  AudioPlayerSkipForward,
  AudioPlayerTimeDisplay,
  AudioPlayerVolume,
} from "@/components/shared/assets/audio/Player"
import { cn } from "cn"

export default function AudioViewerClient({
  data,
}: {
  data: DirectusFileTypes | null
}) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="music_off" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el audio</EmptyTitle>
          <EmptyDescription>El audio que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  const track: Track = {
    id: data.id,
    url: getAssetUrl(data.id) || "",
    title: data.title ?? data.filename_download ?? "Audio",
  }

  return (
    <Card className="px-2 py-4">
      <CardContent className="px-2">
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2.5 pt-2.5">
              <MaterialIcon name="music_note_2" size={24} />
              <h3 className="text-lg leading-none font-medium">
                {track.title}
              </h3>
            </div>
            <AudioPlayer
              className={cn("w-full")}
              tracks={[track]}
              size="sm"
              variant="ghost"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-start gap-2">
                  <AudioPlayerTimeDisplay className="px-2.5" />
                  <AudioPlayerSeekBar className="px-2" />
                  <AudioPlayerTimeDisplay className="px-2.5" remaining />
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex gap-2">
                    <AudioPlayerControlBar className="w-fit in-data-[size=sm]:px-0">
                      <AudioPlayerSkipBack />
                      <AudioPlayerPlay variant="glass" />
                      <AudioPlayerSkipForward />
                    </AudioPlayerControlBar>
                  </div>
                  <div className="flex items-center gap-2">
                    <AudioPlayerVolume variant="glass" />
                  </div>
                </div>
              </div>
            </AudioPlayer>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col items-center justify-center gap-2.5">
          <span className="text-sm">{data.title}</span>
          <span className="text-sm text-muted-foreground">
            {formatBytes(data.filesize ?? 0)}
          </span>
          <Button size="sm" aria-label={`Descargar ${data.title}`}>
            <Link
              href={getAssetUrl(data.id) || ""}
              download
              target="_blank"
              rel="noopener noreferrer"
              title={`Descargar ${data.title}`}
              key={data.title}
            >
              <MaterialIcon name="download" />
              <span>Descargar Imagen</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
