import type { DirectusFileTypes } from "@/types/shared/directus-file"

export type HeroBlockVariant =
  | "simple"
  | "background_img"
  | "right_to_img"
  | "left_to_img"
  | "carousel"
  | "bottom_to_img"
  | "carousel_with_logos"

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
  images: number[]
  brands: number[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
