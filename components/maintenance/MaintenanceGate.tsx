import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getSiteSettingsRepository } from "@/services/domain/db/repositories/singletons/site-settings"

type MaintenanceGateProps = {
  children: ReactNode
}

export async function MaintenanceGate({ children }: MaintenanceGateProps) {
  const siteSettings = await getSiteSettingsRepository()

  if (siteSettings.maintenance_mode) {
    redirect("/maintenance")
  }

  return <>{children}</>
}
