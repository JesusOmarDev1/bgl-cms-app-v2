import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { Box } from "@/components/shared/content/Box"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { setAttr } from "@/config/visual-editing"
import { CtaBlock } from "@/types/blocks/content/cta-block"
import Link from "next/link"

export function CtaNormalClient({ data }: { data: CtaBlock }) {
  if (!data.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="call_to_action" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontró el CTA</EmptyTitle>
          <EmptyDescription>El CTA que buscas no existe.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Box
      data-directus={setAttr({
        collection: "cta_block",
        item: data.id ?? null,
        fields:
          "title, excerpt, variant,  primary_button, secondary_button, secondary_url, primary_url, primary_icon, secondary_icon",
        mode: "popover",
      })}
      className="rounded-2xl bg-linear-to-t from-[#9e1717] via-[#b51b1b] to-red-600 px-4 py-12 backdrop-blur-md sm:px-6 sm:py-16 lg:px-8"
    >
      <h2 className="text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
        {data.title}
      </h2>
      <SafeHtml content={data.excerpt || ""} />
      {data.primary_button && (
        <div className="flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4 lg:mt-14 xl:mt-16 xl:gap-6">
          {data.primary_button ||
            (data.primary_url && (
              <Link href={data.primary_url || ""}>
                <Button variant="red" size="lg">
                  <MaterialIcon name={data.primary_icon} size={20} />
                  {data.primary_button}
                </Button>
              </Link>
            ))}
          {data.secondary_button ||
            (data.secondary_url && (
              <Link href={data.secondary_url || ""}>
                <Button variant="glass" size="lg">
                  {data.secondary_button}
                </Button>
              </Link>
            ))}
        </div>
      )}
    </Box>
  )
}
