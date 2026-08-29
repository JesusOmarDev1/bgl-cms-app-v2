import { placeholder2xl } from "@/assets/placeholders/2xl"
import { placeholder3xl } from "@/assets/placeholders/3xl"
import { placeholderCard } from "@/assets/placeholders/card"
import { placeholderDetail } from "@/assets/placeholders/detail"
import { placeholderHero } from "@/assets/placeholders/hero"
import { placeholderLg } from "@/assets/placeholders/lg"
import { placeholderLogo } from "@/assets/placeholders/logo"
import { placeholderMd } from "@/assets/placeholders/md"
import { placeholderOriginal } from "@/assets/placeholders/original"
import { placeholderSm } from "@/assets/placeholders/sm"
import { placeholderSquare } from "@/assets/placeholders/square"
import { placeholderThumbnail } from "@/assets/placeholders/thumbnail"
import { placeholderUltrawide } from "@/assets/placeholders/ultrawide"
import { placeholderXl } from "@/assets/placeholders/xl"
import { placeholderXs } from "@/assets/placeholders/xs"

type DataImagePlaceholder = `data:image/${string}`

function dataImagePlaceholder(value: string): DataImagePlaceholder {
  if (!value.startsWith("data:image/")) {
    throw new Error("Directus image placeholder must be a data:image URL")
  }
  return value as DataImagePlaceholder
}

export type DirectusImageVariant =
  | "card"
  | "detail"
  | "square"
  | "hero"
  | "logo"
  | "thumbnail"
  | "original"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "ultrawide"

export type DirectusImageSizing = "auto" | "fill" | "contained"

export type DirectusImageQuality = 55 | 60 | 65 | 70 | 75 | 80

type VariantConfig = {
  ratio: number
  placeholder: DataImagePlaceholder
  objectFit: "cover" | "contain"
  fit: "cover" | "contain"
  defaultSize: { w: number; h: number }
  sizes: string
  quality: DirectusImageQuality
}

export const VARIANT_CONFIG = {
  card: {
    ratio: 4 / 5,
    placeholder: dataImagePlaceholder(placeholderCard),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 400, h: 500 },
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    quality: 65,
  },
  detail: {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholderDetail),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 800, h: 450 },
    sizes: "(max-width: 768px) 100vw, 800px",
    quality: 75,
  },
  square: {
    ratio: 1 / 1,
    placeholder: dataImagePlaceholder(placeholderSquare),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 400, h: 400 },
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    quality: 75,
  },
  hero: {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholderHero),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 1200, h: 675 },
    sizes: "100vw",
    quality: 80,
  },
  logo: {
    ratio: 1 / 1,
    placeholder: dataImagePlaceholder(placeholderLogo),
    objectFit: "contain",
    fit: "contain",
    defaultSize: { w: 200, h: 200 },
    sizes: "200px",
    quality: 55,
  },
  thumbnail: {
    ratio: 1 / 1,
    placeholder: dataImagePlaceholder(placeholderThumbnail),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 100, h: 100 },
    sizes: "200px",
    quality: 60,
  },
  original: {
    ratio: 3 / 2,
    placeholder: dataImagePlaceholder(placeholderOriginal),
    objectFit: "contain",
    fit: "contain",
    defaultSize: { w: 600, h: 400 },
    sizes: "(max-width: 768px) 100vw, 600px",
    quality: 80,
  },
  xs: {
    ratio: 9 / 16,
    placeholder: dataImagePlaceholder(placeholderXs),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 320, h: 568 },
    sizes: "320px",
    quality: 70,
  },
  sm: {
    ratio: 9 / 19.5,
    placeholder: dataImagePlaceholder(placeholderSm),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 375, h: 812 },
    sizes: "375px",
    quality: 75,
  },
  md: {
    ratio: 3 / 4,
    placeholder: dataImagePlaceholder(placeholderMd),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 768, h: 1024 },
    sizes: "768px",
    quality: 75,
  },
  lg: {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholderLg),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 1366, h: 768 },
    sizes: "1366px",
    quality: 80,
  },
  xl: {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholderXl),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 1920, h: 1080 },
    sizes: "1920px",
    quality: 80,
  },
  "2xl": {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholder2xl),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 2560, h: 1440 },
    sizes: "2560px",
    quality: 80,
  },
  "3xl": {
    ratio: 16 / 9,
    placeholder: dataImagePlaceholder(placeholder3xl),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 3840, h: 2160 },
    sizes: "3840px",
    quality: 80,
  },
  ultrawide: {
    ratio: 21 / 9,
    placeholder: dataImagePlaceholder(placeholderUltrawide),
    objectFit: "cover",
    fit: "cover",
    defaultSize: { w: 2560, h: 1080 },
    sizes: "2560px",
    quality: 80,
  },
} satisfies Record<DirectusImageVariant, VariantConfig>
