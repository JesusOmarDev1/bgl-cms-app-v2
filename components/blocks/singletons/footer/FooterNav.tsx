import { FooterNavClient } from "./FooterNavClient"
import { FooterNavSkeleton } from "./FooterNavSkeleton"
import { getFooterRepository } from "@/services/domain/db/repositories/singletons/footer"

interface FooterNavProps {
  className?: string
}

export async function FooterNav({ className }: FooterNavProps) {
  const footer = await getFooterRepository()
  if (!footer?.id) return <FooterNavSkeleton />
  return <FooterNavClient data={footer} className={className} />
}
