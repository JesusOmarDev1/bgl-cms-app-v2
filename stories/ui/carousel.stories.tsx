import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Carousel",
  component: Carousel,
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    const slides = [
      { title: t("carousel.slide1_title"), body: t("carousel.slide1_body") },
      { title: t("carousel.slide2_title"), body: t("carousel.slide2_body") },
      { title: t("carousel.slide3_title"), body: t("carousel.slide3_body") },
    ]

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("carousel.with_data")}
          description={t("carousel.with_data_hint")}
        >
          <div className="px-12">
            <Carousel className="mx-auto w-full max-w-sm">
              <CarouselContent>
                {slides.map((slide) => (
                  <CarouselItem key={slide.title}>
                    <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30 p-6 text-center">
                      <div>
                        <p className="font-medium">{slide.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {slide.body}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("carousel.single")}
          description={t("carousel.single_hint")}
        >
          <div className="px-12">
            <Carousel className="mx-auto w-full max-w-sm">
              <CarouselContent>
                <CarouselItem>
                  <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30 p-6 text-center">
                    <div>
                      <p className="font-medium">
                        {t("carousel.slide1_title")}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("carousel.slide1_body")}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
