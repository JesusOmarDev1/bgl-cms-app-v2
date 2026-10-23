import dynamic from "next/dynamic"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"
import { HeroBackgroundImage } from "./HeroBackgroundImage"
import { HeroBesideImage } from "./HeroBesideImage"
import { HeroBottomImage } from "./HeroBottomImage"
import { HeroSkeleton } from "./HeroSkeleton"
import { HeroSimple } from "./HeroSimple"

const HeroCarousel = dynamic(
  () => import("./HeroCarousel").then((mod) => mod.HeroCarousel),
  { loading: () => <HeroSkeleton /> }
)

const HeroCarouselWithLogos = dynamic(
  () =>
    import("./HeroCarouselWithLogos").then((mod) => mod.HeroCarouselWithLogos),
  { loading: () => <HeroSkeleton /> }
)

export function HeroClient({ data }: { data: HeroBlockQuery }) {
  switch (data.variant) {
    case "simple":
      return <HeroSimple data={data} />
    case "background_img":
      return <HeroBackgroundImage data={data} />
    case "left_to_img":
      return <HeroBesideImage data={data} side="left" />
    case "right_to_img":
      return <HeroBesideImage data={data} side="right" />
    case "bottom_to_img":
      return <HeroBottomImage data={data} />
    case "carousel":
      return <HeroCarousel data={data} />
    case "carousel_with_logos":
      return <HeroCarouselWithLogos data={data} />
    default:
      return null
  }
}
