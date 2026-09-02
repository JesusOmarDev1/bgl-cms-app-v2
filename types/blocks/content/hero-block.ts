import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { HeroBlockBrandsJunction } from "@/types/collections/junctions/hero-block-brands"
import type { HeroBlockFilesJunction } from "@/types/collections/junctions/hero-block-files"
import type { HeroBlockVariant } from "@/types/enums/hero-block-variant"

export interface HeroBlock {
  // General
  id: string
  title: string
  variant: HeroBlockVariant
  image: string | DirectusFileTypes | null
  sort: number | null
  primary_button: string
  primary_url: string
  primary_icon: string
  secondary_button: string | null
  secondary_url: string | null
  secondary_icon: string | null
  excerpt: string | null
  images: number[] | HeroBlockFilesJunction[]
  brands: number[] | HeroBlockBrandsJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
