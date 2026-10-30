import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { LinkButton } from "@/components/ui/button"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import {
  Empty,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

function MissingHero() {
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

function HeroActions({ data }: { data: HeroBlockQuery }) {
  if (!data.primary_button && !data.secondary_button) return null

  return (
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
  )
}

export function HeroBesideImage({
  data,
  side,
}: {
  data: HeroBlockQuery
  side: "left" | "right"
}) {
  if (!data.id) return <MissingHero />

  return (
    <Box
      className="w-full lg:h-dvh"
      cols={{ base: 1, lg: 2 }}
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields:
          "title,excerpt,variant,image,images,brands,primary_button,primary_url,primary_icon,secondary_button,secondary_url,secondary_icon",
        mode: "popover",
      })}
      display="grid"
      render={(props) => <section {...props} />}
    >
      <BoxContainer
        className={
          side === "left" ? "pt-28 lg:order-2 lg:pt-0" : "pt-28 lg:pt-0"
        }
        display="flex"
        justify="center"
        orientation="vertical"
      >
        <div className="flex w-full max-w-7xl flex-col items-start gap-4 px-4 text-balance">
          {data.title ? (
            <h1 className="w-full text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {data.title}
            </h1>
          ) : null}
          {data.excerpt ? (
            <SafeHtml
              className="text-lg text-muted-foreground"
              content={data.excerpt}
              preset="compact"
            />
          ) : null}
          <HeroActions data={data} />
        </div>
      </BoxContainer>
      <div
        className={
          side === "left"
            ? "relative min-h-72 lg:order-1 lg:h-full"
            : "relative min-h-72 lg:h-full"
        }
      >
        <div className="absolute inset-0">
          <DirectusImage
            key={data.image?.id}
            alt={data.image?.title ?? ""}
            className="size-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
            sizing="fill"
            src={data.image?.id}
            variant="hero"
          />
        </div>
      </div>
    </Box>
  )
}
