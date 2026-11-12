import type { ReactNode } from "react"
import { PublicSite } from "@/components/blocks/layout/PublicSite"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PublicSite>{children}</PublicSite>
}
