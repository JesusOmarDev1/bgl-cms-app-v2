// API CMS
export const BASE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://bglbasculas.app"
export const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? ""
export const DIRECTUS_PREVIEW_SECRET = process.env.DIRECTUS_PREVIEW_SECRET ?? ""
export const DIRECTUS_LOG_LEVEL = process.env.DIRECTUS_LOG_LEVEL ?? "info"

// VISUAL EDITING
export const VISUAL_EDITING_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING === "true"

// CLOUDFARE TURNSTILE
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? ""
export const TURNSTILE_VERIFY_URL =
  process.env.NEXT_PUBLIC_TURNSTILE_VERIFY_URL ??
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// ARCJET API SECURITY
export const ARCJET_KEY = process.env.ARCJET_KEY ?? ""
export const ARCJET_MODE = process.env.ARCJET_MODE ?? "DRY_RUN"
export const ARCJET_LOG_LEVEL = process.env.ARCJET_LOG_LEVEL ?? "info"

// GOOGLE ANALYTICS
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""

// MEILISEARCH
export const MEILISEARCH_HOST =
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST ?? "https://bglbasculas.tech/"
export const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY ?? ""

// CACHE DIRECTUS CMS
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? ""
export const CACHE_LOG_LEVEL = process.env.CACHE_LOG_LEVEL ?? "info"

// WEBSITE URL
export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://bglbasculas.com.mx"

// REDIS
export const REDIS_HOST = process.env.REDIS_URL ?? ""
