import { beforeEach, describe, expect, it, vi } from "vitest"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"

const {
  search,
  consume,
  getPageBySlug,
  getPages,
  getManuals,
  getServices,
  getBlogPosts,
  getProducts,
  notFound,
} = vi.hoisted(() => ({
  search: vi.fn(),
  consume: vi.fn(),
  getPageBySlug: vi.fn(),
  getPages: vi.fn(),
  getManuals: vi.fn(),
  getServices: vi.fn(),
  getBlogPosts: vi.fn(),
  getProducts: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/link", async () => {
  const { createElement } = await import("react")
  return {
    default: ({
      href,
      children,
      ...props
    }: {
      href: string
      children?: React.ReactNode
      [key: string]: unknown
    }) => createElement("a", { ...props, href }, children),
  }
})
vi.mock("@directus/visual-editing", () => ({ setAttr: () => "" }))
vi.mock("@/assets/logos/static-logo", () => ({ StaticLogo: () => null }))
vi.mock("@/assets/logos/cities/mexico", () => ({ MexicoCityIcon: () => null }))
vi.mock("@/components/shared/assets/img/DirectusImage", () => ({
  DirectusImage: () => null,
}))
vi.mock("@/components/shared/assets/icons/MaterialIcon", () => ({
  MaterialIcon: () => null,
}))
vi.mock("@/hooks/useScroll", () => ({ useScroll: () => false }))
vi.mock("@/components/ui/button", async () => {
  const { createElement } = await import("react")
  const linkButton = ({
    href,
    children,
    ...props
  }: {
    href: string
    children?: React.ReactNode
    [key: string]: unknown
  }) => createElement("a", { ...props, href }, children)
  const button = ({
    children,
    ...props
  }: {
    children?: React.ReactNode
    [key: string]: unknown
  }) => createElement("button", props, children)
  return { LinkButton: linkButton, Button: button }
})
vi.mock("@/components/ui/navigation-menu", async () => {
  const { createElement } = await import("react")
  const wrapper = ({ children }: { children?: React.ReactNode }) =>
    createElement("div", null, children)
  const menuLink = ({
    render,
    children,
  }: {
    render?: React.ReactNode
    children?: React.ReactNode
  }) => render ?? createElement("div", null, children)
  return {
    NavigationMenu: wrapper,
    NavigationMenuContent: wrapper,
    NavigationMenuItem: wrapper,
    NavigationMenuLink: menuLink,
    NavigationMenuList: wrapper,
    NavigationMenuTrigger: wrapper,
    navigationMenuTriggerStyle: () => "",
  }
})
vi.mock("@/components/ui/accordion", async () => {
  const { createElement } = await import("react")
  const wrapper = ({ children }: { children?: React.ReactNode }) =>
    createElement("div", null, children)
  return {
    Accordion: wrapper,
    AccordionContent: wrapper,
    AccordionItem: wrapper,
    AccordionTrigger: wrapper,
  }
})
vi.mock("@/components/ui/scroll-area", async () => {
  const { createElement } = await import("react")
  return {
    ScrollArea: ({ children }: { children?: React.ReactNode }) =>
      createElement("div", null, children),
  }
})
vi.mock("@/components/ui/sheet", async () => {
  const { createElement } = await import("react")
  return {
    SheetContent: ({ children }: { children?: React.ReactNode }) =>
      createElement("div", null, children),
    SheetDescription: ({ children }: { children?: React.ReactNode }) =>
      createElement("div", null, children),
    SheetHeader: ({ children }: { children?: React.ReactNode }) =>
      createElement("div", null, children),
    SheetTitle: ({ children }: { children?: React.ReactNode }) =>
      createElement("div", null, children),
  }
})
vi.mock("@/components/shared/content/SocialIcon", () => ({
  SocialIcon: () => null,
}))
vi.mock("next/navigation", () => ({ notFound }))
vi.mock("@/services/domain/db/repositories/collections/pages", () => ({
  getPageBySlugRepository: getPageBySlug,
  getPagesRepository: getPages,
}))
vi.mock("@/services/domain/db/repositories/collections/manuals", () => ({
  getManualsRepository: getManuals,
}))
vi.mock("@/services/domain/db/repositories/collections/services", () => ({
  getServicesRepository: getServices,
}))
vi.mock("@/services/domain/db/repositories/collections/blog-posts", () => ({
  getBlogPostsRepository: getBlogPosts,
}))
vi.mock("@/services/domain/db/repositories/collections/products", () => ({
  getProductsRepository: getProducts,
}))
vi.mock("@/components/page/BlockPage", () => ({ RecordBlockPage: () => null }))
vi.mock("@/components/page/BlockPageSkeleton", () => ({
  BlockPageSkeleton: () => null,
}))
vi.mock("@/lib/seo/metadata", () => ({ metadata: (value: unknown) => value }))
vi.mock("@/lib/env/constants", () => ({ WEBSITE_URL: "https://site.example" }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@/config/meilisearch", () => ({
  default: { index: () => ({ search }) },
}))
vi.mock("@/config/rate-limiter", () => ({
  searchLimiter: { consume },
}))
vi.mock("@/lib/server/safe-action", () => ({
  actionClient: {
    inputSchema: () => ({ action: (handler: unknown) => handler }),
  },
}))
vi.mock("@/lib/formatting/sanitize", () => ({
  sanitizeHtmlFields: (hit: SearchHitTypes) => hit,
}))

import { searchAction } from "./search"
import Page, { generateMetadata } from "@/app/(site)/[slug]/page"
import sitemap, { generateSitemaps } from "@/app/sitemap"
import * as React from "react"
import { createElement, type ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { HeaderNavClient } from "@/components/blocks/singletons/header/HeaderNavClient"
import { FooterNavClient } from "@/components/blocks/singletons/footer/FooterNavClient"
import { MobileNavClient } from "@/components/blocks/singletons/header/mobile/MobileNavClient"

describe("manuals public visibility", () => {
  beforeEach(() => {
    consume.mockResolvedValue(undefined)
  })

  it("keeps ordinary manuals collection and URL search results", async () => {
    const publicHit: SearchHitTypes = {
      id: "1",
      collection: "pages",
      title: "Público",
      excerpt: "",
      slug: "publico",
      url: "/publico",
      image: null,
    }
    const hits: SearchHitTypes[] = [
      publicHit,
      { ...publicHit, id: "2", collection: "manuals", url: "/documento" },
      { ...publicHit, id: "3", url: "/manuales/guia" },
      {
        ...publicHit,
        id: "4",
        url: "https://other.example/manuales/guia",
      },
    ]
    search.mockResolvedValue({ hits })

    const runAction = searchAction as unknown as (input: {
      parsedInput: { query: string }
    }) => Promise<SearchHitTypes[]>
    await expect(
      runAction({ parsedInput: { query: "balanza" } })
    ).resolves.toEqual(hits)
  })

  it("preserves the ordinary search provider limit", async () => {
    const publicHit: SearchHitTypes = {
      id: "public-after-manuals",
      collection: "pages",
      title: "Resultado público",
      excerpt: "",
      slug: "resultado-publico",
      url: "/resultado-publico",
      image: null,
    }
    search.mockResolvedValue({
      hits: Array.from({ length: 10 }, (_, index) => ({
        ...publicHit,
        id: `manual-${index}`,
        collection: "manuals",
        url: `/manuales/${index}`,
      })),
    })

    const runAction = searchAction as unknown as (input: {
      parsedInput: { query: string }
    }) => Promise<SearchHitTypes[]>
    await expect(
      runAction({ parsedInput: { query: "balanza" } })
    ).resolves.toEqual(
      Array.from({ length: 10 }, (_, index) => ({
        ...publicHit,
        id: `manual-${index}`,
        collection: "manuals",
        url: `/manuales/${index}`,
      }))
    )
    expect(search).toHaveBeenCalledWith(
      "balanza",
      expect.objectContaining({ limit: 10 })
    )
  })

  it("keeps local manuals CTAs in desktop and mobile navigation", () => {
    const data = {
      primary_button: "Manual primary",
      primary_url: "/manuales/guia",
      secondary_button: "Public secondary",
      secondary_url: "/cotizar",
      url_links: [
        {
          id: 7,
          item: {
            type: "link",
            url: "/manuales",
            title: "Manuales",
            icon: null,
          },
        },
      ],
    } as never
    const desktop = renderToStaticMarkup(
      createElement(HeaderNavClient, { data })
    )
    const mobile = renderToStaticMarkup(
      createElement(MobileNavClient, { data })
    )
    expect(desktop).toContain('href="/manuales/guia"')
    expect(mobile).toContain('href="/manuales/guia"')
    const footer = renderToStaticMarkup(
      createElement(FooterNavClient, { data, healthStatus: "unknown" })
    )
    expect(desktop).toContain("Manual primary")
    expect(mobile).toContain("Manual primary")
    expect(desktop).toContain('href="/manuales"')
    expect(mobile).toContain('href="/manuales"')
    expect(footer).toContain('href="/manuales"')
    expect(desktop).toContain('href="/cotizar"')
    expect(mobile).toContain('href="/cotizar"')
  })

  it("keeps manuals dropdown links visible in desktop, mobile, and footer navigation", () => {
    const data = {
      url_links: [
        {
          id: 8,
          item: {
            type: "dropdown",
            title: "Manuales",
            icon: null,
            sub_links: [
              {
                id: 9,
                sub_links_id: {
                  url: "/manuales/guia",
                  title: "Guía de usuario",
                  icon: null,
                },
              },
            ],
          },
        },
      ],
    } as never
    const desktop = renderToStaticMarkup(
      createElement(HeaderNavClient, { data })
    )
    const mobile = renderToStaticMarkup(
      createElement(MobileNavClient, { data })
    )
    const footer = renderToStaticMarkup(
      createElement(FooterNavClient, { data, healthStatus: "unknown" })
    )

    for (const markup of [desktop, mobile, footer]) {
      expect(markup).toContain('href="/manuales/guia"')
      expect(markup).toContain("Guía de usuario")
    }
  })

  it("preserves external and local manuals CTAs", () => {
    const data = {
      primary_button: "External primary",
      primary_url: "https://other.example/manuales/guia",
      secondary_button: "Manual secondary",
      secondary_url: "/manuales/guia",
      url_links: [],
    } as never
    const desktop = renderToStaticMarkup(
      createElement(HeaderNavClient, { data })
    )
    const mobile = renderToStaticMarkup(
      createElement(MobileNavClient, { data })
    )
    expect(desktop).toContain("External primary")
    expect(mobile).toContain("External primary")
    expect(desktop).toContain("Manual secondary")
    expect(mobile).toContain("Manual secondary")
  })

  it("keeps the ordinary CMS route for the manuals slug and metadata", async () => {
    getPageBySlug.mockResolvedValue([
      { title: "Manuales", excerpt: "Contenido CMS" },
    ])
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "manuales" }) })
    ).resolves.toMatchObject({ title: "Manuales" })
    expect(getPageBySlug).toHaveBeenCalledWith({ slug: "manuales" })

    getPageBySlug.mockClear()
    const page = Page({
      params: Promise.resolve({ slug: "manuales" }),
    }) as ReactElement<{
      children: ReactElement<{
        load: (input: { slug: string }) => Promise<unknown>
      }>
    }>
    await expect(
      page.props.children.props.load({ slug: "manuales" })
    ).resolves.toEqual([{ title: "Manuales", excerpt: "Contenido CMS" }])
    expect(getPageBySlug).toHaveBeenCalledWith({ slug: "manuales" })
  })

  it("publishes manuals in the ordinary CMS pages sitemap", async () => {
    getPages.mockResolvedValue([
      { slug: "manuales" },
      { slug: "pagina-publica" },
    ])
    getServices.mockResolvedValue([])
    getBlogPosts.mockResolvedValue([])
    getProducts.mockResolvedValue([])
    getManuals.mockResolvedValue([{ slug: "guia" }])

    expect(await generateSitemaps()).toContainEqual({ id: "manuals" })
    await expect(sitemap({ id: Promise.resolve("manuals") })).resolves.toEqual([
      { url: "https://site.example/manuales/guia" },
    ])
    await expect(sitemap({ id: Promise.resolve("pages") })).resolves.toEqual([
      { url: "https://site.example/manuales" },
      { url: "https://site.example/pagina-publica" },
    ])
  })
})
