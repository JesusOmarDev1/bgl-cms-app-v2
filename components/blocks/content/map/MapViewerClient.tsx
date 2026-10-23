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
import type { MapBlockQuery } from "@/services/domain/db/queries/blocks/map-block/map-block.fields"
import { setAttr } from "@directus/visual-editing"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Box } from "@/components/shared/content/Box"
import { BlockHeading } from "../../BlockHeading"

export default function MapViewerClient({
  data,
}: {
  data: MapBlockQuery | null
}) {
  if (!data?.id || !data.url_embed) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="my_location" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el mapa</EmptyTitle>
          <EmptyDescription>El mapa que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }
  return (
    <Box orientation="vertical" gap={2} display="flex" padding={2}>
      <BlockHeading title={data.title} excerpt={data.excerpt} />
      <Card
        className="max-h-[500px] p-0"
        data-directus={setAttr({
          collection: "map_block",
          item: data.id ?? null,
          fields: ["title", "excerpt", "url_embed"],
          mode: "drawer",
        })}
      >
        <CardContent className="flex flex-col gap-4 p-0">
          <iframe
            src={data.url_embed}
            title={data.title || "Mapa de ubicación"}
            className="aspect-video min-h-80 w-full border-0"
            width="600"
            height="450"
            style={{
              border: "0",
              filter: "contrast(100%)",
            }}
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            loading="lazy"
          />
        </CardContent>
      </Card>
    </Box>
  )
}
