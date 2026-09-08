import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import type { FooterQueryResult } from "@/services/domain/db/queries/singletons/footer/footer"
import { setAttr } from "@directus/visual-editing"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { DirectusImage } from "@/components/shared/assets/DirectusImage"
import Link from "next/link"
import { StatusIndicator } from "@/components/shared/debug/StatusIndicator"

interface FooterNavClientProps {
  data: FooterQueryResult | null | undefined
  className?: string
}

export function FooterNavClient({ data, className }: FooterNavClientProps) {
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
      <Box>
        <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-8">
            <Link href="/" aria-label="Inicio" title="Inicio">
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
            <p className="mt-1 max-w-xs py-0 text-lg leading-relaxed text-white/60">
              Soluciones de pesaje industrial con la más alta precisión y
              calidad.
            </p>
            <Link
              href="/health"
              aria-label="Salud de la web"
              title="Salud de la web"
            >
              <StatusIndicator status="incident" />
            </Link>
          </div>
        </div>
      </Box>
    </footer>
  )
}
