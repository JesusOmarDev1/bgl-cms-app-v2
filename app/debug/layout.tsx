import type { ReactNode } from "react"
import { PublicChrome } from "@/components/blocks/layout/PublicChrome"

export default function DebugLayout({ children }: { children: ReactNode }) {
  return <PublicChrome>{children}</PublicChrome>
}
