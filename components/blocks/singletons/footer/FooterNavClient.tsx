"use client"

import type { ReactNode } from "react"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import type { FooterQueryResult } from "@/services/domain/db/queries/singletons/footer/footer"
import { setAttr } from "@directus/visual-editing"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { DirectusImage } from "@/components/shared/assets/DirectusImage"
import Link from "next/link"
import {
  StatusIndicator,
  type Status,
} from "@/components/shared/debug/StatusIndicator"
import {
  ContactPositionType,
  ContactPositionLabel,
} from "@/types/enums/contact-position"
import { splitEmail } from "@/lib/formatting/split-email"
import { Separator } from "@/components/ui/separator"
import { SocialIcon } from "@/components/shared/content/SocialIcon"
import { FooterCopyright } from "./FooterCopyright"
import { FooterCompanyLetters } from "./FooterCompanyLetters"
import { CopyButton } from "@/components/shared/content/CopyButton"
import { useTranslations } from "next-intl"

const FOOTER_LEGAL_LINKS = [
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

interface FooterNavClientProps {
  data: FooterQueryResult | null | undefined
  className?: string
  healthStatus: Status
}

type FooterUrlLinkRow = NonNullable<
  NonNullable<FooterQueryResult>["url_links"]
>[number]
type FooterUrlLinkItem = FooterUrlLinkRow["item"]

function isExternalHref(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://")
}

function FooterNavLink({
  href,
  title,
  icon,
}: {
  href: string
  title: string
  icon?: string | null
}) {
  const external = isExternalHref(href)

  return (
    <Link
      href={href}
      aria-label={title}
      title={title}
      className="flex items-center gap-2 text-white/80 hover:text-white"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <MaterialIcon name={icon ?? ""} className="text-muted-foreground" />
      {title}
    </Link>
  )
}

function FooterNavColumn({
  heading,
  headingId,
  children,
}: {
  heading: string
  headingId: string
  children: ReactNode
}) {
  return (
    <nav aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-3 text-lg font-semibold text-white">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </nav>
  )
}

export function FooterNavClient({
  data,
  className,
  healthStatus,
}: FooterNavClientProps) {
  const t = useTranslations("health")
  const urlLinks = data?.url_links ?? []
  const dropdowns: { key: number; item: FooterUrlLinkItem }[] = []
  const links: {
    key: number
    href: string
    title: string
    icon: string | null
  }[] = []

  for (const link of urlLinks) {
    const item = link.item
    if (item == null) continue

    if (item.type === "dropdown") {
      dropdowns.push({ key: link.id, item })
      continue
    }

    if (item.url == null || item.url.length === 0) continue
    links.push({
      key: link.id,
      href: item.url,
      title: item.title,
      icon: item.icon,
    })
  }

  return (
    <footer
      data-directus={setAttr({
        collection: "footer",
        item: data?.id ?? null,
        fields: ["logo_dark", "url_links", "social_links"],
        mode: "popover",
      })}
      className={className}
    >
      <Box display={"grid"} cols={1} paddingInline={2}>
        <div className="grid grid-cols-1 place-content-center items-center gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:place-content-start lg:items-start">
          <div className="flex flex-col gap-2.5">
            <Link href="/" aria-label="Inicio" title="Inicio">
              {data?.logo_dark ? (
                <DirectusImage
                  src={data?.logo_dark?.id ?? ""}
                  alt="Logo de BGL Básculas Industriales"
                  title="Logo de BGL Básculas Industriales"
                  decoding="auto"
                  loading="eager"
                  fetchPriority="high"
                  preload
                  sizing="auto"
                  variant="logo"
                />
              ) : (
                <StaticLogo className="size-20" />
              )}
            </Link>
            <p className="mt-1 max-w-xs py-0 text-lg leading-relaxed text-white/60">
              Soluciones de pesaje industrial con la más alta precisión y
              calidad.
            </p>
            <Link href="/health" aria-label={t("title")} title={t("title")}>
              <StatusIndicator
                status={healthStatus}
                label={t(`indicator.${healthStatus}`)}
              />
            </Link>
          </div>

          {dropdowns.map(({ key, item }) => {
            const subLinks = item.sub_links ?? []
            const rows = subLinks.flatMap((sub) => {
              const subItem = sub.sub_links_id
              if (subItem == null || subItem.url.length === 0) return []
              return [
                {
                  key: sub.id,
                  href: subItem.url,
                  title: subItem.title,
                  icon: subItem.icon,
                },
              ]
            })
            if (rows.length === 0) return null

            return (
              <FooterNavColumn
                key={key}
                heading={item.title}
                headingId={`footer-dropdown-${key}`}
              >
                {rows.map((row) => (
                  <li key={row.key}>
                    <FooterNavLink
                      href={row.href}
                      title={row.title}
                      icon={row.icon}
                    />
                  </li>
                ))}
              </FooterNavColumn>
            )
          })}

          {links.length > 0 ? (
            <FooterNavColumn heading="Enlaces" headingId="footer-enlaces">
              {links.map((row) => (
                <li key={row.key}>
                  <FooterNavLink
                    href={row.href}
                    title={row.title}
                    icon={row.icon}
                  />
                </li>
              ))}
            </FooterNavColumn>
          ) : null}

          <FooterNavColumn heading="Legal" headingId="footer-legal">
            {FOOTER_LEGAL_LINKS.map((legal) => (
              <li key={legal.href}>
                <FooterNavLink
                  href={legal.href}
                  title={legal.title}
                  icon={legal.icon}
                />
              </li>
            ))}
          </FooterNavColumn>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {data?.phones && data.phones.length > 0 && (
            <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
              <span className="text-3xl font-semibold text-muted-foreground md:text-4xl">
                Telefonos
              </span>
              <div className="flex-1">
                <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
                  {data?.phones.map((phone) => (
                    <div key={phone.id} className="flex flex-col gap-1">
                      <span className="font-medium text-white/80 lg:text-xl">
                        {
                          ContactPositionLabel[
                            (phone.item.position as ContactPositionType) ?? ""
                          ]
                        }
                      </span>
                      <Link
                        href={`tel:${phone.item.phone}`}
                        aria-label={`LLamar a ${phone.item.phone}`}
                        title={`LLamar a ${phone.item.phone}`}
                        className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                      >
                        <MaterialIcon
                          name="phone"
                          size={18}
                          className="text-white/40 group-hover:text-white"
                        />
                        {phone.item.phone}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
            <span className="text-3xl font-semibold text-muted-foreground md:text-4xl">
              Horarios de atención
            </span>
            <div className="flex-1">
              <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="schedule"
                    size={18}
                    className="text-muted-foreground"
                  />
                  <span className="font-medium text-white/80 hover:text-white lg:text-xl">
                    Lunes a Viernes: 8:00 - 17:00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="schedule"
                    size={18}
                    className="text-muted-foreground"
                  />
                  <span className="font-medium text-white/80 hover:text-white lg:text-xl">
                    Sábado: 8:00 - 13:00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="schedule"
                    size={18}
                    className="text-muted-foreground"
                  />
                  <span className="font-medium text-white/80 hover:text-white lg:text-xl">
                    Domingo: Cerrado
                  </span>
                </div>
              </div>
            </div>
          </div>
          {data?.emails && data?.emails.length > 0 && (
            <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
              <span className="text-3xl font-semibold text-muted-foreground md:text-4xl">
                Correos
              </span>
              <div className="flex-1">
                <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
                  {data?.emails.map((email) => (
                    <div key={email.id} className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-white/80 lg:text-xl">
                          {
                            ContactPositionLabel[
                              (email.item.position as ContactPositionType) ?? ""
                            ]
                          }
                        </span>
                        <span
                          aria-label={`Enviar correo a ${email.item.email}`}
                          className="group inline-flex items-center gap-2 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                        >
                          <MaterialIcon
                            name="mail"
                            size={18}
                            className="text-white/40 group-hover:text-white"
                          />
                          {(() => {
                            const parts = splitEmail(email.item.email)
                            if (!parts) return email.item.email
                            return (
                              <div className="flex items-center gap-0">
                                {parts.localPart}
                                <MaterialIcon
                                  name="alternate_email"
                                  size={18}
                                  className="text-white/60 group-hover:text-white"
                                />
                                {parts.domain}
                              </div>
                            )
                          })()}
                        </span>
                      </div>
                      <CopyButton content={email.item.email ?? ""} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {data?.social_links && data?.social_links.length > 0 && (
            <div className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
              <span className="text-3xl font-semibold text-muted-foreground md:text-4xl">
                Redes sociales
              </span>
              <div className="flex-1">
                <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
                  {data?.social_links.map((social) => (
                    <div key={social.id} className="flex flex-col gap-1">
                      <Link
                        href={social.item.url}
                        aria-label={`Ir a ${social.item.title}`}
                        title={`Ir a ${social.item.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2.5 text-lg text-white/60 transition-colors duration-200 hover:text-white"
                      >
                        <SocialIcon type={social.item.type} />
                        {social.item.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Separator className="mt-0.5 mb-4" orientation="horizontal" />
          <div className="flex flex-col items-center gap-4">
            <FooterCopyright />
            <FooterCompanyLetters />
          </div>
        </div>
      </Box>
    </footer>
  )
}
