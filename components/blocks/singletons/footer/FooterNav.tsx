import { FooterNavClient } from "./FooterNavClient"
import { FooterNavSkeleton } from "./FooterNavSkeleton"
import { getFooterRepository } from "@/services/domain/db/repositories/singletons/footer"
import { getHealthRepository } from "@/services/domain/db/repositories/endpoints/health"

interface FooterNavProps {
  className?: string
}

export async function FooterNav({ className }: FooterNavProps) {
  const [footer, health] = await Promise.all([
    getFooterRepository(),
    getHealthRepository(),
  ])
  if (!footer?.id) return <FooterNavSkeleton />
  return (
    <FooterNavClient
      data={footer}
      className={className}
      healthStatus={health.ping ? "operational" : "major-outage"}
    />
  )
}
