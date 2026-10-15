/**
 * Proposal only, after this route is verified and you approve it: keep the
 * health schedule; replace duplicated "Cache - ..." event flows with one
 * event flow and one shared POST; retire the old flows only after a
 * side-by-side check.
 */

const queryTags = {
  blog_categories: ["blog_categories", "blog_categories_count"],
  blog_posts: ["blog_posts", "blog_posts_by_slug", "blog_posts_count"],
  brands: ["brands"],
  clients: ["clients", "clients_count"],
  division_services: ["division_services", "division_services_count"],
  emails: ["emails", "emails_count"],
  footer: ["footer"],
  header: ["header"],
  health: ["health"],
  manual_categories: ["manual_categories", "manual_categories_count"],
  manuals: ["manuals", "manuals_by_slug", "manuals_count"],
  models: ["models", "models_count"],
  pages: ["pages", "pages_by_slug", "pages_count"],
  phones: ["phones", "phones_count"],
  product_attributes: ["product_attributes", "product_attributes_count"],
  product_categories: ["product_categories", "product_categories_count"],
  products: ["products", "products_by_slug", "products_count"],
  redirects: ["redirects", "redirects_count"],
  seo: ["seo", "seo_count"],
  services: ["services", "services_by_slug", "services_count"],
  services_button: ["services_button"],
  services_categories: ["services_categories", "services_categories_count"],
  site_settings: ["site_settings"],
  social_links: ["social_links", "social_links_count"],
  sub_links: ["sub_links", "sub_links_count"],
  suppliers: ["suppliers", "suppliers_count"],
  tags: ["tags", "tags_count"],
  url_links: ["url_links", "url_links_count"],
  whatsapp_button: ["whatsapp_button"],
} as const

type CacheTag = (typeof queryTags)[keyof typeof queryTags][number]

const pagesTags = [
  "pages",
  "pages_by_slug",
] as const satisfies readonly CacheTag[]
const servicesTags = [
  "services",
  "services_by_slug",
] as const satisfies readonly CacheTag[]
const manualsTags = [
  "manuals",
  "manuals_by_slug",
] as const satisfies readonly CacheTag[]
const blogPostTags = [
  "blog_posts",
  "blog_posts_by_slug",
] as const satisfies readonly CacheTag[]

function keyed(
  tags: readonly CacheTag[],
  collections: readonly string[]
): Record<string, readonly CacheTag[]> {
  return Object.fromEntries(
    collections.map((collection) => [collection, tags] as const)
  )
}

const embeddedAll: readonly CacheTag[] = [
  ...pagesTags,
  ...servicesTags,
  ...manualsTags,
  ...blogPostTags,
]
const pagesServicesPosts: readonly CacheTag[] = [
  ...pagesTags,
  ...servicesTags,
  ...blogPostTags,
]
const pagesManualsPosts: readonly CacheTag[] = [
  ...pagesTags,
  ...manualsTags,
  ...blogPostTags,
]
const pagesManuals: readonly CacheTag[] = [...pagesTags, ...manualsTags]

export const collectionCacheTags: Record<string, readonly CacheTag[]> = {
  ...queryTags,
  ...keyed(embeddedAll, [
    "carousel_block",
    "carousel_items_block",
    "content_block",
    "content_column_block",
    "hero_block",
    "media_block",
    "qr_code_block",
  ]),
  ...keyed(pagesServicesPosts, ["cta_block"]),
  ...keyed(pagesManualsPosts, ["map_block"]),
  ...keyed(pagesManuals, ["faq_block", "faq_questions"]),
  ...keyed(pagesTags, [
    "brands_block",
    "checkbox_block",
    "clients_block",
    "date_block",
    "division_services_block",
    "email_block",
    "featured_products_block",
    "featured_services_block",
    "form_block",
    "logos_clients_block",
    "number_block",
    "phone_block",
    "suppliers_block",
    "text_area_block",
    "text_block",
  ]),
}

export function tagsForCollection(
  collection: string
): readonly CacheTag[] | undefined {
  if (!Object.hasOwn(collectionCacheTags, collection)) return undefined
  return collectionCacheTags[collection]
}
