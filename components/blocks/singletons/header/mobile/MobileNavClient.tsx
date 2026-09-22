"use client"

import { FacebookIcon } from "@/assets/logos/social/facebook"
import { InstagramIcon } from "@/assets/logos/social/instagram"
import { PinterestIcon } from "@/assets/logos/social/pinterest"
import { TiktokIcon } from "@/assets/logos/social/tiktok"
import { TwitterXIcon } from "@/assets/logos/social/twitterX"
import { WhatsAppIcon } from "@/assets/logos/social/whatsapp"
import { YouTubeIcon } from "@/assets/logos/social/youtube"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { SearchBar } from "@/components/shared/search/SearchBar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "cn"
import type { HeaderQueryResult } from "@/services/domain/db/queries/singletons/header/header"
import type { SocialLinkType } from "@/types/enums/social-link-type"
import Link from "next/link"
import { useState, type ComponentType, type SVGProps } from "react"

const socialIcons: Record<
  SocialLinkType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x_twitter: TwitterXIcon,
  whatsapp: WhatsAppIcon,
  youtube: YouTubeIcon,
  pinterest: PinterestIcon,
  tiktok: TiktokIcon,
}

interface MobileNavClientProps {
  data: NonNullable<HeaderQueryResult>
}

export function MobileNavClient({ data }: MobileNavClientProps) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Abrir menú"
        onPress={() => setOpen(true)}
      >
        <MaterialIcon name="right_panel_open" />
      </Button>
      <SheetContent
        side="right"
        isOpen={open}
        isKeyboardDismissDisabled={searchOpen}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setSearchOpen(false)
        }}
        className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="shrink-0 border-b border-border p-4 pe-12">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <div className="shrink-0 px-4 pt-4">
            <SearchBar
              variant="default"
              portaled={false}
              onNavigate={close}
              onPaletteOpenChange={setSearchOpen}
              className="w-full lg:w-full"
            />
          </div>
          <ScrollArea className="min-h-0 flex-1 px-4">
            <p className="py-3 text-sm font-medium text-muted-foreground">
              Navegación
            </p>
            <Accordion className="w-full pb-4">
              {data.url_links?.map((link) => {
                const item = link.item
                if (item == null || typeof item === "string") return null

                if (item.type === "dropdown") {
                  return (
                    <AccordionItem key={link.id} id={String(link.id)}>
                      <AccordionTrigger className="px-1 text-base hover:no-underline">
                        <span className="flex items-center gap-2">
                          <MaterialIcon
                            className="text-muted-foreground"
                            name={item.icon ?? ""}
                          />
                          {item.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1 border-s border-border ps-4">
                        {item.sub_links?.map((sub) => {
                          const subItem = sub.sub_links_id
                          if (subItem == null || typeof subItem === "string") {
                            return null
                          }
                          if (subItem.url == null || subItem.url.length === 0) {
                            return null
                          }
                          return (
                            <Link
                              key={subItem.id}
                              href={subItem.url}
                              aria-label={subItem.title}
                              title={subItem.title}
                              onClick={close}
                              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <MaterialIcon
                                className="text-muted-foreground"
                                name={subItem.icon ?? ""}
                              />
                              {subItem.title}
                            </Link>
                          )
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  )
                }

                if (item.url == null || item.url.length === 0) return null

                return (
                  <Link
                    key={link.id}
                    href={item.url}
                    aria-label={item.title}
                    title={item.title}
                    onClick={close}
                    className="flex items-center gap-2 rounded-lg px-1 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                  >
                    <MaterialIcon
                      className="text-muted-foreground"
                      name={item.icon ?? ""}
                    />
                    {item.title}
                  </Link>
                )
              })}
            </Accordion>
          </ScrollArea>
          <div className="mt-auto flex shrink-0 flex-col gap-4 border-t border-border p-4">
            {data.primary_button && data.primary_url ? (
              <Link
                href={data.primary_url}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "red", size: "xl" }),
                  "w-full rounded-full"
                )}
              >
                {data.primary_button}
                <MaterialIcon name={data.primary_icon ?? ""} size={16} />
              </Link>
            ) : null}
            {data.secondary_button && data.secondary_url ? (
              <Link
                href={data.secondary_url}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "w-full rounded-full"
                )}
              >
                {data.secondary_button}
                <MaterialIcon name={data.secondary_icon ?? ""} size={16} />
              </Link>
            ) : null}
            {data.social_links && data.social_links.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Síguenos en redes sociales
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.social_links.map((row) => {
                    const item = row.item
                    if (item == null || typeof item === "string") return null
                    if (item.url.length === 0) return null
                    const Icon = socialIcons[item.type]
                    return (
                      <a
                        key={row.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.title}
                        title={item.title}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "rounded-full"
                        )}
                      >
                        <Icon className="size-5" />
                      </a>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </>
  )
}
