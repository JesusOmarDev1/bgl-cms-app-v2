import { getTranslations } from "next-intl/server"
import { MaintenanceView } from "@/components/maintenance/MaintenanceView"
import { metadata as createMetadata } from "@/lib/seo/metadata"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ""

export async function generateMetadata() {
  const t = await getTranslations("server-error")

  return createMetadata({
    title: t("title"),
    description: t("message"),
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
      title: t("title"),
      description: t("message"),
      type: "website",
    },
  })
}

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
