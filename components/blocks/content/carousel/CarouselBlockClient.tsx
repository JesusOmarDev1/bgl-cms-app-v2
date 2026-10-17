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
import type { CarouselBlockQuery } from "@/services/domain/db/queries/blocks/carousel-block/carousel-block.fields"

export function CarouselBlockClient({ data }: { data: CarouselBlockQuery }) {
  const slides = (data.items ?? []).filter((row) => row.item?.image?.id)
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
              {slides.map((row) => (
                <CarouselItem key={row.item.id}>
                  <figure>
                    <DirectusImage
                      alt={row.item.title || ""}
                      className="w-full rounded-xl"
                      sizing="contained"
                      src={row.item.image?.id ?? ""}
                      variant="hero"
                    />
                    {row.item.title ? (
                      <figcaption className="mt-2 text-sm text-muted-foreground">
                        {row.item.title}
                      </figcaption>
                    ) : null}
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : null}
      </Box>
    </BoxContainer>
  )
}
