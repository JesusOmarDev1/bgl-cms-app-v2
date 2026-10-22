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
  EmptyHeader,
  EmptyMedia,
  EmptyDescription,
  EmptyTitle,
  EmptyContent,
} from "@/components/ui/empty"

export function HeroBottomImage({ data }: { data: HeroBlockQuery }) {
  if (!data.id) {
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
      // ponytail: matches HeaderSpacer h-24. If that spacer changes, update this calc.
      className="min-h-[calc(100dvh-6rem)] w-full grid-rows-[auto_minmax(18rem,1fr)]"
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
      <BoxContainer>
        <div className="flex max-w-3xl flex-col gap-4">
          {data.title ? (
            <h1 className="font-semibold tracking-tight">{data.title}</h1>
          ) : null}
          {data.excerpt ? (
            <SafeHtml content={data.excerpt} preset="compact" />
          ) : null}
          {data.primary_button || data.secondary_button ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {data.primary_button ? (
                <LinkButton
                  href={data.primary_url ?? ""}
                  size="lg"
                  variant="red"
                >
                  <MaterialIcon name={data.primary_icon ?? ""} size={20} />
                  {data.primary_button}
                </LinkButton>
              ) : null}
              {data.secondary_button ? (
                <LinkButton
                  href={data.secondary_url ?? ""}
                  size="lg"
                  variant="glass"
                >
                  <MaterialIcon name={data.secondary_icon ?? ""} size={20} />
                  {data.secondary_button}
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </BoxContainer>
      <div className="relative h-full min-h-72">
        <div className="absolute inset-0">
          <DirectusImage
            key={data.image?.id}
            alt={data.image?.title ?? ""}
            className="size-full"
            sizing="fill"
            src={data.image?.id}
            variant="hero"
          />
        </div>
      </div>
    </Box>
  )
}
