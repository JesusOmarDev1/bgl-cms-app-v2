"use client"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Marquee } from "@/components/shared/content/Marquee"
import {
  Empty,
  EmptyContent,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty"
import type { BrandsBlockQuery } from "@/services/domain/db/queries/blocks/brands-block/brands-block.fields"
import { setAttr } from "@directus/visual-editing"

export function CarouselBrandsClient({ data }: { data: BrandsBlockQuery }) {
  if (!data.id) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="copyright" size={24} />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No se encontraron marcas</EmptyTitle>
          <EmptyDescription>Las marcas que buscas no existen.</EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="h-fit w-full overflow-hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="my-14 flex flex-col gap-6 px-4 text-center text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
          <span
            className="text-red-500"
            data-directus={setAttr({
              collection: "brands_block",
              item: data.id,
              fields: "title",
              mode: "popover",
            })}
          >
            {data.title}
          </span>
          {data.excerpt ? (
            <SafeHtml
              content={data.excerpt}
              className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl"
            />
          ) : null}
        </div>
      </div>
      <Marquee
        className="z-10 w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        pauseOnHover
        rows={2}
        repeat={3}
        rowGap="1rem"
      >
        {data.brands?.map((row) => {
          const src = row.brands_id.logo?.id
          if (!src) return null
          return (
            <DirectusImage
              key={row.id}
              src={src}
              alt={row.brands_id.title}
              title={row.brands_id.title}
              variant="logo"
            />
          )
        })}
      </Marquee>
      <div className="relative -mt-5 h-24 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] [-webkit-mask-image:radial-gradient(50%_50%,white,transparent)] lg:-mt-8 lg:h-36">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#ed1d1d,transparent_70%)] before:opacity-35" />
        <div className="absolute top-1/2 -left-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t border-white/20 bg-background" />
      </div>
    </div>
  )
}
