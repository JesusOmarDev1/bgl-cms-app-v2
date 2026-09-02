export const HeroBlockVariantEnum = [
  "simple",
  "background_img",
  "right_to_img",
  "left_to_img",
  "carousel",
  "bottom_to_img",
  "carousel_with_logos",
] as const
export type HeroBlockVariant = (typeof HeroBlockVariantEnum)[number]
