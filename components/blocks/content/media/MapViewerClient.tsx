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
import { MapBlock } from "@/types/blocks/content/map-block"
import { setAttr } from "@/config/visual-editing"
import { SafeHtml } from "@/components/shared/content/SafeHtml"

const MAP_HEIGHT = "400px"

export default function MapViewerClient({ data }: { data: MapBlock | null }) {
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
    <Card
      data-directus={setAttr({
        collection: "map_block",
        item: data.id ?? null,
        fields: ["title", "excerpt", "url_embed"],
        mode: "drawer",
      })}
    >
      <CardContent className="flex flex-col gap-4">
        <iframe
          src={data.url_embed || ""}
          title={data.title || "Mapa"}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          style={{ height: MAP_HEIGHT, width: "100%" }}
        />
      </CardContent>
      <CardFooter>
        <div className="flex flex-col items-center justify-center gap-2.5">
          <span className="text-sm">{data.title}</span>
          <SafeHtml
            className="text-sm text-muted-foreground"
            content={data.excerpt || ""}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
