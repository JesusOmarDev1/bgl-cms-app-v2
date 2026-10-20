import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
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

export function HeroBackgroundImage({ data }: { data: HeroBlockQuery }) {
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
      className="relative min-h-[28rem] overflow-hidden"
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields: "title,excerpt,variant,image,primary_button,primary_url",
        mode: "popover",
      })}
      render={(props) => <section {...props} />}
    >
      {data.image?.id ? (
        <DirectusImage
          alt=""
          className="absolute inset-0 size-full"
          sizing="fill"
          src={data.image.id}
          variant="hero"
        />
      ) : null}
      <div className="absolute inset-0 bg-background/60" />
      <BoxContainer
        align="end"
        className="relative z-10 min-h-[28rem]"
        display="flex"
      >
        <Box paddingBottom={3} paddingTop={3}>
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
                  <Link href={data.primary_url ?? ""}>
                    <Button size="lg" variant="red">
                      <MaterialIcon name={data.primary_icon ?? ""} size={20} />
                      {data.primary_button}
                    </Button>
                  </Link>
                ) : null}
                {data.secondary_button ? (
                  <Link href={data.secondary_url ?? ""}>
                    <Button size="lg" variant="glass">
                      <MaterialIcon
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
      </BoxContainer>
    </Box>
  )
}
