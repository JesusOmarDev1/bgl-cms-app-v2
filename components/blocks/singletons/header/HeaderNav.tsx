"use client"
import { StaticLogo } from "@/assets/logos/static-logo"
import { setAttr } from "@directus/visual-editing"
import { MexicoCityIcon } from "@/assets/logos/cities/mexico"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { getTranslations } from "next-intl/server"
import { getHeaderRepository } from "@/services/domain/db/repositories/singletons/header"
import { useScroll } from "@/hooks/useScroll"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DirectusImage } from "@/components/shared/assets/DirectusImage"

interface HeaderNavProps {
  className?: string
}

export async function HeaderNav({ className }: HeaderNavProps) {
  const header = await getHeaderRepository()
  const scrolled = useScroll(10)

  return (
    <header
      data-directus={setAttr({
        collection: "header",
        item: header.id ?? undefined,
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
          "mx-auto flex h-24 w-full items-center justify-between px-6 transition-all duration-400 animate-ease-in-out",
          {
            "h-20": scrolled,
          }
        )}
      >
        <NavigationMenuList>
          <Link href="/">
            {header.logo_dark ? (
              <DirectusImage
                src={header.logo_dark as string}
                alt="Logo"
                width={100}
                height={100}
              />
            ) : (
              <StaticLogo />
            )}
          </Link>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}
