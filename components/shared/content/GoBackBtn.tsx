import type { ReactNode } from "react"

import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { LinkButton } from "@/components/ui/button"

export function GoBackBtn({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <LinkButton className="w-fit rounded-full" href={href} variant="ghost">
      <MaterialIcon data-icon="inline-start" name="arrow_back" />
      {children}
    </LinkButton>
  )
}
