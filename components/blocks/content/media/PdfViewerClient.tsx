"use client"
import { Empty, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getAssetUrl } from "@/lib/directus/asset-url"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DirectusFileTypes } from "@/types/shared/directus/directus-file"

export default function PdfViewerClient({
  data,
}: {
  data: DirectusFileTypes | null
}) {
  if (!data?.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="pdf" size={24} />
          </EmptyMedia>
        </EmptyHeader>
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
