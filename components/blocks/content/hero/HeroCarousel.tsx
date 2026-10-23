"use client"

import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { LinkButton } from "@/components/ui/button"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Marquee } from "@/components/shared/content/Marquee"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"

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
      align="center"
      className="relative h-dvh w-full"
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields:
          "title,excerpt,variant,image,images,brands,primary_button,primary_url,primary_icon,secondary_button,secondary_url,secondary_icon",
        mode: "popover",
      })}
      display="flex"
      justify="center"
      orientation="vertical"
      render={(props) => <section {...props} />}
    >
      <BoxContainer
        align="center"
        className="relative z-10 w-full"
        display="flex"
        gap={2}
        orientation="vertical"
      >
        <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center text-balance">
          {data.title ? (
            <h1 className="w-full text-4xl font-semibold tracking-tight text-shadow-2xs sm:text-5xl md:text-7xl lg:text-8xl">
              {data.title}
            </h1>
          ) : null}
          {data.excerpt ? (
            <SafeHtml
              className="text-lg text-muted-foreground text-shadow-2xs"
              content={data.excerpt}
              preset="compact"
            />
          ) : null}
          {data.primary_button || data.secondary_button ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {data.primary_button ? (
                <LinkButton href={data.primary_url ?? ""} variant="red">
                  <MaterialIcon
                    className="text-primary"
                    name={data.primary_icon ?? ""}
                    size={20}
                  />
                  {data.primary_button}
                </LinkButton>
              ) : null}
              {data.secondary_button ? (
                <LinkButton href={data.secondary_url ?? ""} variant="glass">
                  <MaterialIcon
                    className="text-primary"
                    name={data.secondary_icon ?? ""}
                    size={20}
                  />
                  {data.secondary_button}
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </BoxContainer>
      <Marquee
        className="absolute inset-0 -z-10 h-full w-full mask-b-from-60% opacity-40"
        variant="fade"
      >
        {(data.images ?? []).map((row) => (
          <DirectusImage
            key={row.id}
            alt={row.directus_files_id.title ?? ""}
            className="size-full"
            sizing="fill"
            src={row.directus_files_id.id}
            variant="hero"
          />
        ))}
      </Marquee>
    </Box>
  )
}
