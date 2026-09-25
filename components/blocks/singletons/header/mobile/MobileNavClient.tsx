"use client"

import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
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
import Link from "next/link"
import { useEffect, useState } from "react"
import { SocialIcon } from "@/components/shared/content/SocialIcon"

type SearchBarComponent =
  typeof import("@/components/shared/search/SearchBar").SearchBar

interface MobileNavClientProps {
  data: NonNullable<HeaderQueryResult>
  /** False skips the search chunk. Storybook sets this so ioredis never evaluates. */
  search?: boolean
}

export function MobileNavClient({ data, search = true }: MobileNavClientProps) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [SearchBar, setSearchBar] = useState<SearchBarComponent | null>(null)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!search) return
    let live = true
    void import("@/components/shared/search/SearchBar").then((mod) => {
      if (live) setSearchBar(() => mod.SearchBar)
    })
    return () => {
      live = false
    }
  }, [search])

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xl"
        className="rounded-full lg:hidden"
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
            <SheetTitle className="text-base font-medium text-muted-foreground">
              Menú de navegación
            </SheetTitle>
          </SheetHeader>
          {SearchBar ? (
            <div className="shrink-0 border-b border-border px-4 py-4">
              <SearchBar
                variant="default"
                portaled={false}
                onNavigate={close}
                onPaletteOpenChange={setSearchOpen}
                className="w-full lg:w-full"
              />
            </div>
          ) : null}
          <ScrollArea className="min-h-0 flex-1 px-4">
            <p className="py-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Navegación
            </p>
            <Accordion className="w-full pb-4">
              {data.url_links?.map((link) => {
                const item = link.item
                if (item == null || typeof item === "string") return null

                if (item.type === "dropdown") {
                  return (
                    <AccordionItem key={link.id} id={String(link.id)}>
                      <AccordionTrigger className="flex items-center px-2.5 text-base hover:bg-muted hover:no-underline">
                        <span className="flex items-center gap-2">
                          <MaterialIcon
                            className="text-muted-foreground"
                            name={item.icon ?? ""}
                          />
                          {item.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="ml-5 flex flex-col gap-1 border-s border-border ps-4">
                        {item.sub_links?.map((sub) => {
                          return (
                            <Link
                              key={sub.id}
                              href={sub.sub_links_id.url}
                              aria-label={sub.sub_links_id.title}
                              title={sub.sub_links_id.title}
                              onClick={close}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm text-foreground no-underline! hover:bg-muted"
                            >
                              <MaterialIcon
                                className="text-muted-foreground"
                                name={sub.sub_links_id.icon ?? ""}
                              />
                              {sub.sub_links_id.title}
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
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-base font-medium text-foreground no-underline hover:bg-muted"
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
                  buttonVariants({ variant: "secondary", size: "xl" }),
                  "w-full rounded-full"
                )}
              >
                {data.secondary_button}
                <MaterialIcon name={data.secondary_icon ?? ""} size={16} />
              </Link>
            ) : null}
            {data.social_links && data.social_links.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  Síguenos en redes sociales
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.social_links.map((social) => {
                    return (
                      <Link
                        key={social.id}
                        href={social.item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.item.title}
                        title={social.item.title}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-xl" }),
                          "rounded-full"
                        )}
                      >
                        <SocialIcon type={social.item.type} />
                      </Link>
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
