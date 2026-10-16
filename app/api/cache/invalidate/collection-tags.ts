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

const contentTags = [
  "pages",
  "pages_by_slug",
  "services",
  "services_by_slug",
  "manuals",
  "manuals_by_slug",
  "blog_posts",
  "blog_posts_by_slug",
] as const

export function tagsForCollection(
  collection: string
): readonly string[] | undefined {
  if (Object.hasOwn(queryTags, collection)) {
    return queryTags[collection as keyof typeof queryTags]
  }
  if (collection.endsWith("_block") || collection === "faq_questions") {
    return contentTags
  }
  return undefined
}

function assertCollectionTags(): void {
  const pages = tagsForCollection("pages")
  if (!pages?.includes("pages_by_slug") || !pages?.includes("pages_count")) {
    throw new Error("collection tags self-check: pages")
  }
  const cta = tagsForCollection("cta_block")
  if (!cta?.includes("manuals_by_slug") || cta?.includes("pages_count")) {
    throw new Error("collection tags self-check: cta_block")
  }
  if (tagsForCollection("pages_body") !== undefined) {
    throw new Error("collection tags self-check: pages_body")
  }
}

assertCollectionTags()
