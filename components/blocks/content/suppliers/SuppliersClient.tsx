import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { SuppliersBlockQuery } from "@/services/domain/db/queries/blocks/suppliers-block/suppliers-block.fields"

export function SuppliersClient({ data }: { data: SuppliersBlockQuery }) {
  const hasLogo = data.suppliers?.some((row) => row.item?.logo?.id)
  if (!data.title && !data.excerpt && !hasLogo) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "suppliers_block",
          item: data.id,
          fields: "title,excerpt,suppliers",
          mode: "popover",
        })}
        display="flex"
        gap={2}
        orientation="vertical"
        paddingBottom={3}
        paddingTop={3}
        render={(props) => <section {...props} />}
      >
        <BlockHeading excerpt={data.excerpt} title={data.title} />
        {hasLogo ? (
          <Carousel className="px-12">
            <CarouselContent>
              {data.suppliers?.map((row) => {
                const src = row.item?.logo?.id
                if (!src) return null
                const name = row.item?.name ?? ""
                const website = row.item?.website
                const image = (
                  <DirectusImage
                    alt={name}
                    src={src}
                    title={name}
                    variant="logo"
                  />
                )
                return (
                  <CarouselItem key={row.id} className="basis-1/2 md:basis-1/4">
                    <div className="flex justify-center">
                      {website ? (
                        <Link href={website} aria-label={name}>
                          {image}
                        </Link>
                      ) : (
                        image
                      )}
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
