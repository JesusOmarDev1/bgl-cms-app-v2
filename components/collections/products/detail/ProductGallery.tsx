"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "cn"

export function ProductGallery({
  images,
}: {
  images: { id: string; alt: string }[]
}) {
  const t = useTranslations("products")
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  if (images.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <Carousel
        aria-label={t("gallery")}
        className="rounded-xl bg-card/30 ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        opts={{ loop: images.length > 1 }}
        setApi={setApi}
        tabIndex={0}
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <DirectusImage
                alt={image.alt}
                className="aspect-[4/3] w-full"
                imgClassName="h-full w-full"
                sizing="contained"
                src={image.id}
                style={{ height: "100%", objectFit: "contain", width: "100%" }}
                variant="original"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 ? (
          <>
            <CarouselPrevious
              aria-label={t("previous_image")}
              className="start-3"
            />
            <CarouselNext aria-label={t("next_image")} className="end-3" />
          </>
        ) : null}
      </Carousel>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              aria-label={t("thumbnail", { index: index + 1 })}
              aria-pressed={index === current}
              className={cn(
                "w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-foreground/10",
                index === current && "ring-2 ring-foreground"
              )}
              key={image.id}
              onClick={() => api?.scrollTo(index)}
              type="button"
            >
              <DirectusImage
                alt=""
                className="w-full"
                sizing="contained"
                src={image.id}
                variant="original"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
