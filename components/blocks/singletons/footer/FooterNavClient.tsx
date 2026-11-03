"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { useTranslations } from "next-intl"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { CopyButton } from "@/components/shared/content/CopyButton"
import { SocialIcon } from "@/components/shared/content/SocialIcon"
import {
  StatusIndicator,
  type Status,
} from "@/components/shared/debug/StatusIndicator"
import { StaticLogo } from "@/assets/logos/static-logo"
import type { FooterQueryResult } from "@/services/domain/db/queries/singletons/footer/footer"
import {
  ContactPositionType,
  ContactPositionLabel,
} from "@/types/enums/contact-position"
import { splitEmail } from "@/lib/formatting/split-email"
import { COOKIE_CONSENT_OPEN_EVENT } from "@/components/shared/utility/CookieConsent"
import { FooterCopyright } from "./FooterCopyright"
import { FooterCompanyLetters } from "./FooterCompanyLetters"

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
type FooterLink = {
  key: number
  href: string
  title: string
  icon: string | null
}
type FooterDropdown = { key: number; item: FooterUrlLinkItem }

function FooterNavLink({
  href,
  title,
  icon,
}: {
  href: string
  title: string
  icon?: string | null
}) {
  const external = href.startsWith("https://") || href.startsWith("http://")
  return (
    <Link
      href={href}
      aria-label={title}
      title={title}
      className="flex items-center gap-2 text-white/80 hover:text-white"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <MaterialIcon name={icon ?? ""} />
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

function FooterDropdownColumn({
  dropdown,
  id,
}: {
  dropdown: FooterUrlLinkItem
  id: number
}) {
  const rows = (dropdown.sub_links ?? []).flatMap((sub) => {
    const item = sub.sub_links_id
    if (item == null || item.url.length === 0) return []
    return [{ key: sub.id, href: item.url, title: item.title, icon: item.icon }]
  })
  if (rows.length === 0) return null
  return (
    <FooterNavColumn
      heading={dropdown.title}
      headingId={`footer-dropdown-${id}`}
    >
      {rows.map((row) => (
        <li key={row.key}>
          <FooterNavLink href={row.href} title={row.title} icon={row.icon} />
        </li>
      ))}
    </FooterNavColumn>
  )
}

function FooterDetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col items-start justify-start gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:gap-10">
      <span className="text-2xl font-semibold text-muted-foreground">
        {title}
      </span>
      <div className="flex-1">
        <div className="flex flex-col flex-wrap gap-3 lg:flex-row lg:gap-10">
          {children}
        </div>
      </div>
    </section>
  )
}

function FooterPhoneLinks({
  data,
}: {
  data: FooterQueryResult | null | undefined
}) {
  if (!data?.phones?.length) return null
  return (
    <FooterDetailSection title="Telefonos">
      {data.phones.map((phone) => (
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
    </FooterDetailSection>
  )
}

function FooterEmailAddress({ email }: { email: string }) {
  const parts = splitEmail(email)
  if (!parts) return email
  return (
    <span className="flex items-center gap-0">
      {parts.localPart}
      <MaterialIcon
        name="alternate_email"
        size={18}
        className="text-white/60 group-hover:text-white"
      />
      {parts.domain}
    </span>
  )
}

function FooterEmailLinks({
  data,
}: {
  data: FooterQueryResult | null | undefined
}) {
  if (!data?.emails?.length) return null
  return (
    <FooterDetailSection title="Correos">
      {data.emails.map((email) => (
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
              <FooterEmailAddress email={email.item.email} />
            </span>
          </div>
          <CopyButton content={email.item.email ?? ""} />
        </div>
      ))}
    </FooterDetailSection>
  )
}

function FooterSocialLinks({
  data,
}: {
  data: FooterQueryResult | null | undefined
}) {
  if (!data?.social_links?.length) return null
  return (
    <FooterDetailSection title="Redes sociales">
      {data.social_links.map((social) => (
        <Link
          key={social.id}
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
      ))}
    </FooterDetailSection>
  )
}

function FooterNavigation({
  data,
  dropdowns,
  links,
  healthStatus,
}: {
  data: FooterQueryResult | null | undefined
  dropdowns: FooterDropdown[]
  links: FooterLink[]
  healthStatus: Status
}) {
  const tHealth = useTranslations("health")
  const tCookies = useTranslations("cookies")
  return (
    <div className="grid grid-cols-1 place-content-center items-center gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:place-content-start lg:items-start">
      <div className="flex flex-col gap-2.5">
        <Link href="/" aria-label="Inicio" title="Inicio">
          {data?.logo_dark ? (
            <DirectusImage
              src={data.logo_dark.id ?? ""}
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
          Soluciones de pesaje industrial con la más alta precisión y calidad.
        </p>
        <Link
          href="/health"
          aria-label={tHealth("title")}
          title={tHealth("title")}
        >
          <StatusIndicator
            status={healthStatus}
            label={tHealth(`indicator.${healthStatus}`)}
          />
        </Link>
      </div>
      {dropdowns.map(({ key, item }) => (
        <FooterDropdownColumn key={key} dropdown={item} id={key} />
      ))}
      {links.length ? (
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
        <li>
          <button
            type="button"
            className="flex items-center gap-2 border-0 bg-transparent p-0 text-white/80 hover:text-white"
            onClick={() =>
              window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))
            }
          >
            <MaterialIcon name="cookie" />
            {tCookies("manage")}
          </button>
        </li>
      </FooterNavColumn>
    </div>
  )
}

function FooterDetails({
  data,
}: {
  data: FooterQueryResult | null | undefined
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FooterPhoneLinks data={data} />
      <FooterDetailSection title="Horarios de atención">
        {[
          "Lunes a Viernes: 8:00 - 17:00",
          "Sábado: 8:00 - 13:00",
          "Domingo: Cerrado",
        ].map((hours) => (
          <div key={hours} className="flex items-center gap-2">
            <MaterialIcon name="schedule" size={18} />
            <span className="font-medium text-white/80 hover:text-white lg:text-xl">
              {hours}
            </span>
          </div>
        ))}
      </FooterDetailSection>
      <FooterEmailLinks data={data} />
      <FooterSocialLinks data={data} />
      <div className="flex flex-col items-center gap-4">
        <FooterCopyright />
        <FooterCompanyLetters />
      </div>
    </div>
  )
}

export function FooterNavClient({
  data,
  className,
  healthStatus,
}: FooterNavClientProps) {
  const dropdowns: FooterDropdown[] = []
  const links: FooterLink[] = []
  for (const link of data?.url_links ?? []) {
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
      <Box display="grid" cols={1} paddingInline={2}>
        <FooterNavigation
          data={data}
          dropdowns={dropdowns}
          links={links}
          healthStatus={healthStatus}
        />
        <FooterDetails data={data} />
      </Box>
    </footer>
  )
}
