"use client"

import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "cn"
import type { HeaderQueryResult } from "@/services/domain/db/queries/singletons/header/header"
import Link from "next/link"
import { Fragment, useState } from "react"
import { SocialIcon } from "@/components/shared/content/SocialIcon"

const MOBILE_NAV_LINKS = [
  {
    href: "/legal/politicas-de-privacidad",
    title: "Política de privacidad",
    icon: "policy",
  },
  {
    href: "/legal/politicas-de-cookies",
    title: "Política de cookies",
    icon: "cookie",
  },
  {
    href: "/legal/politicas-de-seguridad",
    title: "Política de seguridad",
    icon: "verified_user",
  },
  {
    href: "/legal/terminos-de-uso-y-datos",
    title: "Términos de uso",
    icon: "gavel",
  },
] as const

interface MobileNavClientProps {
  data: NonNullable<HeaderQueryResult>
}

export function MobileNavClient({ data }: MobileNavClientProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Fragment>
      <Button
        variant="ghost"
        size="icon-xl"
        className="rounded-full min-[1366px]:hidden"
        aria-label="Abrir menú"
        onPress={() => setOpen(true)}
      >
        <MaterialIcon name="right_panel_open" />
      </Button>
      <SheetContent
        side="right"
        isOpen={open}
        onOpenChange={setOpen}
        className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="shrink-0 border-b border-border p-4 pe-12">
            <div className="flex items-center gap-2">
              <MaterialIcon
                name="page_menu_ios"
                className="text-muted-foreground"
              />
              <SheetTitle className="text-xl font-medium uppercase">
                Menú de navegación
              </SheetTitle>
            </div>
            <SheetDescription>
              Aquí puedes encontrar todos los enlaces de navegación de la web.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4">
            <p className="py-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Navegación
            </p>
            <Accordion className="w-full pb-4">
              {data.url_links?.map((link) => {
                const item = link.item
                if (item == null) return null

                if (item.type === "dropdown") {
                  return (
                    <AccordionItem key={link.id} id={String(link.id)}>
                      <AccordionTrigger className="flex items-center px-2.5 text-base hover:bg-muted hover:text-foreground hover:no-underline">
                        <span className="flex items-center gap-2">
                          <MaterialIcon
                            className="text-muted-foreground"
                            name={item.icon ?? ""}
                          />
                          {item.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="ml-5 flex flex-col gap-1 ps-4">
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
              <AccordionItem id="legal">
                <AccordionTrigger className="flex items-center px-2.5 text-base hover:bg-muted hover:text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <MaterialIcon
                      className="text-muted-foreground"
                      name="cases"
                    />
                    Legal
                  </span>
                </AccordionTrigger>
                <AccordionContent className="ml-5 flex flex-col gap-1">
                  {MOBILE_NAV_LINKS.map((link) => {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-label={link.title}
                        title={link.title}
                        onClick={close}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm text-foreground no-underline! hover:bg-muted"
                      >
                        <MaterialIcon
                          className="text-muted-foreground"
                          name={link.icon ?? ""}
                        />
                        {link.title}
                      </Link>
                    )
                  })}
                </AccordionContent>
              </AccordionItem>
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
    </Fragment>
  )
}
