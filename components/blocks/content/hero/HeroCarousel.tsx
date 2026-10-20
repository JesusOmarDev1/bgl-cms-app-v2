"use client"

import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Box } from "@/components/shared/content/Box"

export function HeroCarousel({ data }: { data: HeroBlockQuery }) {
  if (!data.images?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="web" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el bloque</EmptyTitle>
          <EmptyDescription>Intentalo de nuevo mas tarde.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Box
      display="flex"
      orientation="vertical"
      justify="center"
      align="center"
      className="relative h-dvh w-full"
    >
      <Box
        className="relative z-10"
        display="flex"
        gap={2}
        orientation="vertical"
      >
        <div className="flex max-w-7xl flex-col items-center justify-center gap-4 text-center">
          {data.title ? (
            <h1 className="text-8xl font-semibold tracking-tight drop-shadow-2xl">
              {data.title}
            </h1>
          ) : null}
          {data.excerpt ? (
            <SafeHtml
              className="text-lg text-muted-foreground drop-shadow-2xl"
              content={data.excerpt}
              preset="compact"
            />
          ) : null}
          {data.primary_button || data.secondary_button ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {data.primary_button ? (
                <Link href={data.primary_url ?? ""}>
                  <Button size="lg" variant="red">
                    <MaterialIcon
                      className="text-primary"
                      name={data.primary_icon ?? ""}
                      size={20}
                    />
                    {data.primary_button}
                  </Button>
                </Link>
              ) : null}
              {data.secondary_button ? (
                <Link href={data.secondary_url ?? ""}>
                  <Button size="lg" variant="glass">
                    <MaterialIcon
                      className="text-primary"
                      name={data.secondary_icon ?? ""}
                      size={20}
                    />
                    {data.secondary_button}
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </Box>
      <Carousel
        className="absolute inset-0 -z-10 h-dvh w-full"
        plugins={[
          Autoplay({
            delay: 2000,
            playOnInit: true,
          }),
        ]}
      >
        <CarouselContent className="relative max-h-dvh w-full mask-b-from-50%">
          {(data.images ?? []).map((row) => (
            <CarouselItem key={row.id}>
              <DirectusImage
                alt={row.directus_files_id.title ?? ""}
                sizing="auto"
                src={row.directus_files_id.id}
                variant="hero"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </Box>
  )
}
