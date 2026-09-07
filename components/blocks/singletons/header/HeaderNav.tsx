import { getHeaderRepository } from "@/services/domain/db/repositories/singletons/header"
import { HeaderNavClient } from "./HeaderNavClient"
import { HeaderNavSkeleton } from "./HeaderNavSkeleton"

interface HeaderNavProps {
  className?: string
}

export async function HeaderNav({ className }: HeaderNavProps) {
  const header = await getHeaderRepository()
  if (!header.id) return <HeaderNavSkeleton />
  return <HeaderNavClient header={header} className={className} />
}
