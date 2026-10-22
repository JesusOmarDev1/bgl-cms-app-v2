import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

export function HeroSimple({ data }: { data: HeroBlockQuery }) {
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
      <BoxContainer
        align="center"
        className="relative w-full"
        display="flex"
        gap={2}
        orientation="vertical"
      >
        <Card>
          <CardContent className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center text-balance">
            {data.title ? (
              <CardTitle className="w-full text-4xl font-semibold tracking-tight drop-shadow-2xl sm:text-5xl md:text-7xl lg:text-8xl">
                {data.title}
              </CardTitle>
            ) : null}
            {data.excerpt ? (
              <CardDescription>
                <SafeHtml
                  className="text-lg text-muted-foreground drop-shadow-2xl"
                  content={data.excerpt}
                  preset="compact"
                />
              </CardDescription>
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
          </CardContent>
        </Card>
      </BoxContainer>
    </Box>
  )
}
