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

export default function ImageViewerClient({
  data,
}: {
  data: DirectusFileTypes | null
}) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="hide_image" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró la imagen</EmptyTitle>
          <EmptyDescription>La imagen que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <DirectusImage
          src={data.id}
          alt={data.title || ""}
          title={data.title || ""}
          variant="detail"
          width={100}
          height={100}
        />
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
