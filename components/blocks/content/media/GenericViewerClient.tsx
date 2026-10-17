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
import type { DirectusFileQuery } from "@/services/domain/db/queries/blocks/directus-file/directus-file.fields"
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { FileType, getFileType } from "@/components/shared/content/FileType"

export default function GenericViewerClient({
  data,
}: {
  data: DirectusFileQuery | null
}) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileType
              type={getFileType(data?.filename_download || data?.type || "")}
              className="size-full"
            />
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
          <AttachmentMedia>
            <FileType
              type={getFileType(data?.type || "")}
              className="size-full"
            />
          </AttachmentMedia>
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
