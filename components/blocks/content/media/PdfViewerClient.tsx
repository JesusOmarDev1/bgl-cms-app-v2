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
import { PdfIcon } from "@/assets/logos/docs/pdf"
import { formatBytes } from "@/lib/formatting/format-bytes"

export default function PdfViewerClient({
  data,
}: {
  data: DirectusFileQuery | null
}) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PdfIcon />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el PDF</EmptyTitle>
          <EmptyDescription>El PDF que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <embed
          src={getAssetUrl(data.id) || ""}
          type="application/pdf"
          className="h-150 w-full rounded-md"
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
              <span>Descargar PDF</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
