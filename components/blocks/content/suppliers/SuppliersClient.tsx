import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import {
  directusFileId,
  expandedJunctions,
  isExpanded,
  isPublishedStatus,
} from "@/components/blocks/directus-relation"
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
import type { SuppliersBlock } from "@/types/blocks/content/suppliers-block"
import type { SuppliersBlockSuppliersJunction } from "@/types/collections/junctions/suppliers-block-suppliers"

function logosOf(suppliers: SuppliersBlock["suppliers"]) {
  const logos: {
    id: number
    src: string
    name: string
    website: string | null
  }[] = []
  for (const row of expandedJunctions<SuppliersBlockSuppliersJunction>(
    suppliers
  )) {
    if (!isExpanded(row.item)) continue
    if (!isPublishedStatus(row.item.status)) continue
    if (row.item.active === false) continue
    const src = directusFileId(row.item.logo)
    if (!src) continue
    logos.push({
      id: row.id,
      src,
      name: row.item.name,
      website: row.item.website,
    })
  }
  return logos
}

export function SuppliersClient({ data }: { data: SuppliersBlock }) {
  const logos = logosOf(data.suppliers)
  if (!data.title && !data.excerpt && logos.length === 0) return null

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
        {logos.length > 0 ? (
          <Carousel className="px-12">
            <CarouselContent>
              {logos.map((logo) => {
                const image = (
                  <DirectusImage
                    alt={logo.name}
                    src={logo.src}
                    title={logo.name}
                    variant="logo"
                  />
                )
                return (
                  <CarouselItem
                    key={logo.id}
                    className="basis-1/2 md:basis-1/4"
                  >
                    <div className="flex justify-center">
                      {logo.website ? (
                        <Link href={logo.website} aria-label={logo.name}>
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
