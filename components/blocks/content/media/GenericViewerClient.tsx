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
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getAssetUrl } from "@/lib/directus/asset-url"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { ReactNode } from "react"
import { WordIcon } from "@/assets/logos/docs/word"
import { ExcelIcon } from "@/assets/logos/docs/excel"
import { PdfIcon } from "@/assets/logos/docs/pdf"
import { PowerpointIcon } from "@/assets/logos/docs/powerpoint"

export default function GenericViewerClient({
  data,
}: {
  data: DirectusFileTypes | null
}) {
  function getIconFile(mimeType: string | null): ReactNode {
    switch (mimeType) {
      case "application/pdf":
        return <PdfIcon />
      case "application/msword":
        return <WordIcon />
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <WordIcon />
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return <ExcelIcon />
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return <PowerpointIcon />
      case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
        return <PowerpointIcon />
      case "image/*":
        return <MaterialIcon name="image" size={24} />
      case "video/*":
        return <MaterialIcon name="video" size={24} />
      case "audio/*":
        return <MaterialIcon name="audio" size={24} />
      default:
        return <MaterialIcon name="file_present" size={24} />
    }
  }

  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {getIconFile(data?.type || "")}
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el archivo</EmptyTitle>
          <EmptyDescription>El archivo que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Attachment className="w-full">
          <AttachmentMedia>{getIconFile(data?.type || "")}</AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>
              {data?.title || data?.filename_download || "Archivo sin título"}
            </AttachmentTitle>
            <AttachmentDescription>
              {data?.description || "No hay descripción para este archivo"}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button
              size="sm"
              aria-label={`Descargar ${data?.title || data?.filename_download || "Archivo sin título"}`}
            >
              <Link
                href={getAssetUrl(data?.id) || ""}
                download
                target="_blank"
                rel="noopener noreferrer"
                title={`Descargar ${data?.title || data?.filename_download || "Archivo sin título"}`}
                key={
                  data?.title || data?.filename_download || "Archivo sin título"
                }
              >
                <MaterialIcon name="download" />
                <span>Descargar Archivo</span>
              </Link>
            </Button>
          </AttachmentActions>
        </Attachment>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col items-center justify-center gap-2.5">
          <span className="text-sm">{data.title}</span>
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
              <span>Descargar PDF</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
