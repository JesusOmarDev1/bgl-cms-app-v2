import { getTranslations } from "next-intl/server"
import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { metadata as createMetadata } from "@/lib/seo/metadata"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""

export const metadata = createMetadata({
  title: "Error del servidor",
  description: "Error del servidor. Espera un momento e inténtalo de nuevo.",
  keywords: ["505", "server error", "internal server error"],
  canonical: `${BASE_URL}/505`,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Error del servidor",
    description: "Error del servidor. Espera un momento e inténtalo de nuevo.",
    type: "website",
  },
})

export default async function ServerErrorPage() {
  const t = await getTranslations("server-error")

  return (
    <MaintenanceView
      title={t("title")}
      message={t("message")}
      statusLabel={t("statusLabel")}
      helperText={t("helperText")}
      status="unknown"
    />
  )
}
