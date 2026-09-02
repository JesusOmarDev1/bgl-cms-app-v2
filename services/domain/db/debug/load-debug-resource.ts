import "server-only"

import { cache } from "react"

import type { JsonValue } from "@/components/shared/debug/JsonViewer"
import { toJsonValue } from "@/lib/debug/json-value"
import {
  getDebugResourceEntry,
  isDebugCollectionKey,
  type DebugCollectionKey,
  type DebugKind,
  type DebugResourceKey,
} from "@/services/domain/db/debug/catalog"
import {
  getBlogCategoriesCountRepository,
  getBlogCategoriesRepository,
} from "@/services/domain/db/repositories/collections/blog-categories"
import {
  getBlogPostsCountRepository,
  getBlogPostsRepository,
} from "@/services/domain/db/repositories/collections/blog-posts"
import {
  getBrandsCountRepository,
  getBrandsRepository,
} from "@/services/domain/db/repositories/collections/brands"
import {
  getClientsCountRepository,
  getClientsRepository,
} from "@/services/domain/db/repositories/collections/clients"
import {
  getDivisionServicesCountRepository,
  getDivisionServicesRepository,
} from "@/services/domain/db/repositories/collections/division-services"
import {
  getEmailsCountRepository,
  getEmailsRepository,
} from "@/services/domain/db/repositories/collections/emails"
import {
  getManualCategoriesCountRepository,
  getManualCategoriesRepository,
} from "@/services/domain/db/repositories/collections/manual-categories"
import {
  getManualsCountRepository,
  getManualsRepository,
} from "@/services/domain/db/repositories/collections/manuals"
import {
  getModelsCountRepository,
  getModelsRepository,
} from "@/services/domain/db/repositories/collections/models"
import {
  getPagesCountRepository,
  getPagesRepository,
} from "@/services/domain/db/repositories/collections/pages"
import {
  getPhonesCountRepository,
  getPhonesRepository,
} from "@/services/domain/db/repositories/collections/phones"
import {
  getProductAttributesCountRepository,
  getProductAttributesRepository,
} from "@/services/domain/db/repositories/collections/product-attributes"
import {
  getProductCategoriesCountRepository,
  getProductCategoriesRepository,
} from "@/services/domain/db/repositories/collections/product-categories"
import {
  getProductsCountRepository,
  getProductsRepository,
} from "@/services/domain/db/repositories/collections/products"
import {
  getRedirectsCountRepository,
  getRedirectsRepository,
} from "@/services/domain/db/repositories/collections/redirects"
import {
  getSeoCountRepository,
  getSeoRepository,
} from "@/services/domain/db/repositories/collections/seo"
import {
  getServicesCountRepository,
  getServicesRepository,
} from "@/services/domain/db/repositories/collections/services"
import {
  getServicesCategoriesCountRepository,
  getServicesCategoriesRepository,
} from "@/services/domain/db/repositories/collections/services-categories"
import {
  getSocialLinksCountRepository,
  getSocialLinksRepository,
} from "@/services/domain/db/repositories/collections/social-links"
import {
  getSubLinksCountRepository,
  getSubLinksRepository,
} from "@/services/domain/db/repositories/collections/sub-links"
import {
  getSuppliersCountRepository,
  getSuppliersRepository,
} from "@/services/domain/db/repositories/collections/suppliers"
import {
  getTagsCountRepository,
  getTagsRepository,
} from "@/services/domain/db/repositories/collections/tags"
import {
  getUrlLinksCountRepository,
  getUrlLinksRepository,
} from "@/services/domain/db/repositories/collections/url-links"
import { getHealthRepository } from "@/services/domain/db/repositories/endpoints/health"
import { getFooterRepository } from "@/services/domain/db/repositories/singletons/footer"
import { getHeaderRepository } from "@/services/domain/db/repositories/singletons/header"
import { getServicesButtonRepository } from "@/services/domain/db/repositories/singletons/services-button"
import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"
import { getWhatsappButtonRepository } from "@/services/domain/db/repositories/singletons/whatsapp-button"

export type DebugResourcePageQuery = {
  page: number
  limit: number
}

type DebugResourceLoader = (query: DebugResourcePageQuery) => Promise<unknown>

const DEBUG_RESOURCE_LOADERS: Record<DebugResourceKey, DebugResourceLoader> = {
  pages: ({ page, limit }) => getPagesRepository({ page, limit }),
  blog_posts: ({ page, limit }) => getBlogPostsRepository({ page, limit }),
  blog_categories: ({ page, limit }) =>
    getBlogCategoriesRepository({ page, limit }),
  services: ({ page, limit }) => getServicesRepository({ page, limit }),
  services_categories: ({ page, limit }) =>
    getServicesCategoriesRepository({ page, limit }),
  division_services: ({ page, limit }) =>
    getDivisionServicesRepository({ page, limit }),
  manuals: ({ page, limit }) => getManualsRepository({ page, limit }),
  manual_categories: ({ page, limit }) =>
    getManualCategoriesRepository({ page, limit }),
  products: ({ page, limit }) => getProductsRepository({ page, limit }),
  product_categories: ({ page, limit }) =>
    getProductCategoriesRepository({ page, limit }),
  product_attributes: ({ page, limit }) =>
    getProductAttributesRepository({ page, limit }),
  brands: ({ page, limit }) => getBrandsRepository({ page, limit }),
  clients: ({ page, limit }) => getClientsRepository({ page, limit }),
  suppliers: ({ page, limit }) => getSuppliersRepository({ page, limit }),
  models: ({ page, limit }) => getModelsRepository({ page, limit }),
  emails: ({ page, limit }) => getEmailsRepository({ page, limit }),
  phones: ({ page, limit }) => getPhonesRepository({ page, limit }),
  seo: ({ page, limit }) => getSeoRepository({ page, limit }),
  redirects: ({ page, limit }) => getRedirectsRepository({ page, limit }),
  tags: ({ page, limit }) => getTagsRepository({ page, limit }),
  social_links: ({ page, limit }) => getSocialLinksRepository({ page, limit }),
  url_links: ({ page, limit }) => getUrlLinksRepository({ page, limit }),
  sub_links: ({ page, limit }) => getSubLinksRepository({ page, limit }),
  site_settings: () => getSiteSettingsRepository(),
  header: () => getHeaderRepository(),
  footer: () => getFooterRepository(),
  whatsapp_button: () => getWhatsappButtonRepository(),
  services_button: () => getServicesButtonRepository(),
  health: () => getHealthRepository(),
}

const DEBUG_COLLECTION_COUNT_LOADERS = {
  pages: cache(() => getPagesCountRepository()),
  blog_posts: cache(() => getBlogPostsCountRepository()),
  blog_categories: cache(() => getBlogCategoriesCountRepository()),
  services: cache(() => getServicesCountRepository()),
  services_categories: cache(() => getServicesCategoriesCountRepository()),
  division_services: cache(() => getDivisionServicesCountRepository()),
  manuals: cache(() => getManualsCountRepository()),
  manual_categories: cache(() => getManualCategoriesCountRepository()),
  products: cache(() => getProductsCountRepository()),
  product_categories: cache(() => getProductCategoriesCountRepository()),
  product_attributes: cache(() => getProductAttributesCountRepository()),
  brands: cache(() => getBrandsCountRepository()),
  clients: cache(() => getClientsCountRepository()),
  suppliers: cache(() => getSuppliersCountRepository()),
  models: cache(() => getModelsCountRepository()),
  emails: cache(() => getEmailsCountRepository()),
  phones: cache(() => getPhonesCountRepository()),
  seo: cache(() => getSeoCountRepository()),
  redirects: cache(() => getRedirectsCountRepository()),
  tags: cache(() => getTagsCountRepository()),
  social_links: cache(() => getSocialLinksCountRepository()),
  url_links: cache(() => getUrlLinksCountRepository()),
  sub_links: cache(() => getSubLinksCountRepository()),
} satisfies Record<DebugCollectionKey, () => Promise<number>>

export async function loadDebugResource(
  kind: DebugKind | null,
  resource: string | null,
  query: DebugResourcePageQuery
): Promise<JsonValue | null> {
  if (kind === null || resource === null) {
    return null
  }

  const entry = getDebugResourceEntry(kind, resource)

  if (entry === null) {
    return null
  }

  const data = await DEBUG_RESOURCE_LOADERS[entry.key](query)

  return toJsonValue(data)
}

export const loadDebugCollectionCount = cache(
  async function loadDebugCollectionCount(
    kind: DebugKind | null,
    resource: string | null
  ): Promise<number> {
    if (kind === null || resource === null) {
      return 0
    }

    const entry = getDebugResourceEntry(kind, resource)

    if (entry === null || !isDebugCollectionKey(entry.key)) {
      return 0
    }

    return await DEBUG_COLLECTION_COUNT_LOADERS[entry.key]()
  }
)
