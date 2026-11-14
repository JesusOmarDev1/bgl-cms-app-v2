import { beforeEach, describe, expect, it, vi } from "vitest"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"

const {
  search,
  consume,
  getPageBySlug,
  getPages,
  getServices,
  getBlogPosts,
  getProducts,
  notFound,
} = vi.hoisted(() => ({
  search: vi.fn(),
  consume: vi.fn(),
  getPageBySlug: vi.fn(),
  getPages: vi.fn(),
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
import { MobileNavClient } from "@/components/blocks/singletons/header/mobile/MobileNavClient"

describe("manuals public visibility", () => {
  beforeEach(() => {
    consume.mockResolvedValue(undefined)
  })

  it("excludes manuals search results while retaining unrelated and external results", async () => {
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
    ).resolves.toEqual([publicHit, hits[3]])
  })

  it("can return public search hits ranked after ten manuals", async () => {
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
      hits: [
        ...Array.from({ length: 10 }, (_, index) => ({
          ...publicHit,
          id: `manual-${index}`,
          collection: "manuals",
          url: `/manuales/${index}`,
        })),
        publicHit,
      ],
    })

    const runAction = searchAction as unknown as (input: {
      parsedInput: { query: string }
    }) => Promise<SearchHitTypes[]>
    await expect(
      runAction({ parsedInput: { query: "balanza" } })
    ).resolves.toEqual([publicHit])
    expect(search).toHaveBeenCalledWith(
      "balanza",
      expect.objectContaining({ limit: 20 })
    )
  })

  it("hides local manuals CTAs in desktop and mobile navigation", () => {
    const data = {
      primary_button: "Manual primary",
      primary_url: "/manuales/guia",
      secondary_button: "Public secondary",
      secondary_url: "/cotizar",
      url_links: [],
    } as never
    const desktop = renderToStaticMarkup(
      createElement(HeaderNavClient, { data })
    )
    const mobile = renderToStaticMarkup(
      createElement(MobileNavClient, { data })
    )
    expect(desktop).not.toContain("Manual primary")
    expect(mobile).not.toContain("Manual primary")
    expect(desktop).toContain('href="/cotizar"')
    expect(mobile).toContain('href="/cotizar"')
  })

  it("preserves external CTAs with a manuals path while hiding local secondary CTAs", () => {
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
    expect(desktop).not.toContain("Manual secondary")
    expect(mobile).not.toContain("Manual secondary")
  })

  it("rejects the generic manuals slug before page lookup, including metadata", async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "manuales" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(getPageBySlug).not.toHaveBeenCalled()

    const page = Page({
      params: Promise.resolve({ slug: "manuales" }),
    }) as ReactElement<{
      children: ReactElement<{
        load: (input: { slug: string }) => Promise<unknown>
      }>
    }>
    await expect(
      page.props.children.props.load({ slug: "manuales" })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(getPageBySlug).not.toHaveBeenCalled()
  })

  it("does not publish a manuals sitemap source", async () => {
    getPages.mockResolvedValue([
      { slug: "manuales" },
      { slug: "pagina-publica" },
    ])
    getServices.mockResolvedValue([])
    getBlogPosts.mockResolvedValue([])
    getProducts.mockResolvedValue([])

    expect(await generateSitemaps()).not.toContainEqual({ id: "manuals" })
    await expect(sitemap({ id: Promise.resolve("manuals") })).resolves.toEqual(
      []
    )
    await expect(sitemap({ id: Promise.resolve("pages") })).resolves.toEqual([
      { url: "https://site.example/pagina-publica" },
    ])
  })
})
