"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import GenericViewerClient from "./GenericViewerClient"
import { formatBytes } from "@/lib/formatting/format-bytes"

export default function MultipleFilesViewerClient({
  data,
}: {
  data: DirectusFileTypes[] | null
}) {
  return (
    <Card>
      <CardContent className="flex flex-col flex-wrap gap-4">
        {data?.map((file) => (
          <GenericViewerClient key={file.id} data={file} />
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex flex-col items-center justify-center gap-2.5">
          <span className="text-sm">Total de archivos: {data?.length}</span>
          <span className="text-sm text-muted-foreground">
            {formatBytes(
              data?.reduce((acc, file) => acc + (file.filesize ?? 0), 0) ?? 0
            )}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
