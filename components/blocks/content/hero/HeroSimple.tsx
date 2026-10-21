import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { LinkButton } from "@/components/ui/button"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"

export function HeroSimple({ data }: { data: HeroBlockQuery }) {
  const primary =
    data.primary_button && data.primary_url
      ? {
          label: data.primary_button,
          href: data.primary_url,
          icon: data.primary_icon,
        }
      : null
  const secondary =
    data.secondary_button && data.secondary_url
      ? {
          label: data.secondary_button,
          href: data.secondary_url,
          icon: data.secondary_icon ?? "",
        }
      : null
  if (!data.title && !data.excerpt && !primary && !secondary) return null

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
        <div className="flex max-w-3xl flex-col gap-4">
          {data.title ? (
            <h1 className="font-semibold tracking-tight">{data.title}</h1>
          ) : null}
          {data.excerpt ? (
            <SafeHtml content={data.excerpt} preset="compact" />
          ) : null}
          {primary || secondary ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {primary ? (
                <LinkButton href={primary.href} size="lg" variant="red">
                  <MaterialIcon name={primary.icon} size={20} />
                  {primary.label}
                </LinkButton>
              ) : null}
              {secondary ? (
                <LinkButton href={secondary.href} size="lg" variant="glass">
                  <MaterialIcon name={secondary.icon} size={20} />
                  {secondary.label}
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </BoxContainer>
    </Box>
  )
}
