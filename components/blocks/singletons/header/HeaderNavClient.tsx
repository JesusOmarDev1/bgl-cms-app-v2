"use client"

import { setAttr } from "@directus/visual-editing"
import Link from "next/link"
import { StaticLogo } from "@/assets/logos/static-logo"
import { DirectusImage } from "@/components/shared/assets/DirectusImage"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useScroll } from "@/hooks/useScroll"
import { cn } from "@/lib/utils"
import type { HeaderQueryResult } from "@/services/domain/db/queries/singletons/header/header"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"

interface HeaderNavClientProps {
  data: HeaderQueryResult | null | undefined
  className?: string
}

export function HeaderNavClient({ data, className }: HeaderNavClientProps) {
  const scrolled = useScroll(10)

  return (
    <header
      data-directus={setAttr({
        collection: "header",
        item: data?.id ?? "",
        fields: [
          "logo_dark",
          "primary_button",
          "primary_url",
          "primary_icon",
          "url_links",
        ],
        mode: "popover",
      })}
      className={cn(
        "fixed top-0 z-50 w-full border-b border-transparent transition-all duration-400 animate-ease-in-out",
        {
          "border-border bg-background/30 backdrop-blur-sm supports-backdrop-filter:bg-background/30":
            scrolled,
        },
        className
      )}
    >
      <NavigationMenu
        className={cn(
          "flex h-24 min-w-screen items-center px-6 transition-all duration-400 animate-ease-in-out",
          {
            "h-20": scrolled,
          }
        )}
      >
        <NavigationMenuList className="flex w-full justify-between">
          <div className="flex items-center justify-center gap-4">
            <Link href="/" aria-label="">
              {data?.logo_dark ? (
                <DirectusImage
                  src={data?.logo_dark?.id ?? ""}
                  alt="Logo de BGL Básculas Industriales"
                  title="Logo de BGL Básculas Industriales"
                  width={100}
                  height={100}
                  quality={80}
                  decoding="auto"
                  loading="eager"
                  fetchPriority="high"
                  preload
                  sizes="(max-width: 320px) 500px, (max-width: 768px) 500px, 500px"
                  sizing="auto"
                  variant="logo"
                />
              ) : (
                <StaticLogo />
              )}
            </Link>
            <div className="flex items-center gap-2.5">
              {data?.url_links &&
                data.url_links.length > 0 &&
                data.url_links.map((link) => {
                  const item = link.item
                  if (item == null) return null

                  const title = item.title
                  const url = item.url

                  if (item.type === "dropdown") {
                    const subLinks = item.sub_links ?? []

                    return (
                      <NavigationMenuItem
                        className="hidden lg:flex"
                        key={link.id}
                      >
                        <NavigationMenuTrigger className="flex items-center gap-1.5">
                          <MaterialIcon
                            className="text-muted-foreground"
                            name={item.icon ?? ""}
                          />
                          {title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="flex min-w-2xs flex-col gap-1.5">
                          {subLinks.map((sub) => {
                            const subItem = sub.sub_links_id
                            if (subItem == null) return null
                            if (
                              subItem.url == null ||
                              subItem.url.length === 0
                            ) {
                              return null
                            }

                            return (
                              <NavigationMenuLink
                                key={subItem.id}
                                className={cn(
                                  navigationMenuTriggerStyle(),
                                  "flex w-full justify-start"
                                )}
                                render={
                                  <Link
                                    href={subItem.url}
                                    aria-label={subItem.title}
                                    title={subItem.title}
                                    className="flex items-center gap-1.5"
                                  >
                                    <MaterialIcon
                                      className="text-muted-foreground"
                                      name={subItem.icon ?? ""}
                                    />
                                    {subItem.title}
                                  </Link>
                                }
                              />
                            )
                          })}
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )
                  }

                  if (url == null || url.length === 0) return null

                  return (
                    <NavigationMenuItem
                      className="hidden lg:flex"
                      key={link.id}
                    >
                      <NavigationMenuLink
                        className={cn(navigationMenuTriggerStyle())}
                        render={
                          <Link
                            href={url}
                            aria-label={title}
                            title={title}
                            className="flex items-center gap-1.5"
                          >
                            <MaterialIcon
                              className="text-muted-foreground"
                              name={item.icon ?? ""}
                            />
                            {title}
                          </Link>
                        }
                      />
                    </NavigationMenuItem>
                  )
                })}
            </div>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}
