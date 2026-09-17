import { getTranslations } from "next-intl/server"
import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { metadata as createMetadata } from "@/lib/seo/metadata"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""

export const metadata = createMetadata({
  title: "Servicio no disponible",
  description:
    "Demasiadas solicitudes en este momento. Espera un momento e inténtalo de nuevo.",
  keywords: ["503", "unavailable", "rate limit"],
  canonical: `${BASE_URL}/503`,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Servicio no disponible",
    description:
      "Demasiadas solicitudes en este momento. Espera un momento e inténtalo de nuevo.",
    type: "website",
  },
})

export default async function ServiceUnavailablePage() {
  const t = await getTranslations("unavailable")

  return (
    <MaintenanceView
      title={t("title")}
      message={t("message")}
      statusLabel={t("statusLabel")}
      helperText={t("helperText")}
      status="major-outage"
    />
  )
}
