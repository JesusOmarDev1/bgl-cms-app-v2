import { setAttr } from "@directus/visual-editing"
import { BlockHeading } from "@/components/blocks/BlockHeading"
import {
  directusFileId,
  expandedJunctions,
  isExpanded,
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
import type { CarouselItemsBlock } from "@/types/blocks/carousel/carousel-items-block"
import type { CarouselBlock } from "@/types/blocks/carousel/carousel-block"
import type { CarouselBlockItemsJunction } from "@/types/collections/junctions/carousel-block-items"

function slidesOf(items: CarouselBlock["items"]): CarouselItemsBlock[] {
  const slides: CarouselItemsBlock[] = []
  for (const row of expandedJunctions<CarouselBlockItemsJunction>(items)) {
    if (row.collection !== "carousel_items_block") continue
    if (!isExpanded(row.item)) continue
    if (!directusFileId(row.item.image)) continue
    slides.push(row.item)
  }
  return slides
}

export function CarouselBlockClient({ data }: { data: CarouselBlock }) {
  const slides = slidesOf(data.items)
  if (!data.title && !data.excerpt && slides.length === 0) return null

  return (
    <BoxContainer>
      <Box
        data-directus={setAttr({
          collection: "carousel_block",
          item: data.id,
          fields: "title,excerpt,variant,items",
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
        {slides.length > 0 ? (
          <Carousel className="px-12">
            <CarouselContent>
              {slides.map((slide) => {
                const src = directusFileId(slide.image)
                if (!src) return null
                return (
                  <CarouselItem key={slide.id}>
                    <figure>
                      <DirectusImage
                        alt={slide.title || ""}
                        className="w-full rounded-xl"
                        sizing="contained"
                        src={src}
                        variant="hero"
                      />
                      {slide.title ? (
                        <figcaption className="mt-2 text-sm text-muted-foreground">
                          {slide.title}
                        </figcaption>
                      ) : null}
                    </figure>
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
