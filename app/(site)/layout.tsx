import type { ReactNode } from "react"
import { MaintenanceGate } from "@/components/maintenance/MaintenanceGate"

type SiteLayoutProps = {
  children: ReactNode
}

export const instant = false

export default function SiteLayout({ children }: SiteLayoutProps) {
  return <MaintenanceGate>{children}</MaintenanceGate>
}
