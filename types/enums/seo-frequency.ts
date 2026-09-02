export const SeoFrequencyEnum = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const
export type SeoFrequency = (typeof SeoFrequencyEnum)[number]
