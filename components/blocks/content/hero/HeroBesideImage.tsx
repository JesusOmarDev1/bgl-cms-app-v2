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
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function HeroBesideImage({
  data,
  side,
}: {
  data: HeroBlockQuery
  side: "left" | "right"
}) {
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
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields:
          "title,excerpt,variant,image,images,brands,primary_button,primary_url,primary_icon,secondary_button,secondary_url,secondary_icon",
        mode: "popover",
      })}
      display="flex"
      gap={3}
      orientation="vertical"
      paddingBottom={3}
      paddingTop={3}
      render={(props) => <section {...props} />}
    >
      <BoxContainer>
        <Box align="center" cols={{ base: 1, md: 2 }} display="grid" gap={3}>
          {side === "left" && data.image?.id ? (
            <DirectusImage
              alt={data.title ?? ""}
              className="w-full rounded-xl"
              sizing="contained"
              src={data.image.id}
              variant="hero"
            />
          ) : null}
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
          {side === "right" && data.image?.id ? (
            <DirectusImage
              alt={data.title ?? ""}
              className="w-full rounded-xl"
              sizing="contained"
              src={data.image.id}
              variant="hero"
            />
          ) : null}
        </Box>
      </BoxContainer>
    </Box>
  )
}
