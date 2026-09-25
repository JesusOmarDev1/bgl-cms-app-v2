import { Suspense } from "react"
import { SearchBar } from "@/components/shared/search/SearchBar"
import { getHeaderRepository } from "@/services/domain/db/repositories/singletons/header"
import { HeaderNavClient } from "./HeaderNavClient"
import { HeaderNavSkeleton } from "./HeaderNavSkeleton"
import { MobileNav } from "./mobile/MobileNav"
import { MobileNavSkeleton } from "./mobile/MobileNavSkeleton"

interface HeaderNavProps {
  className?: string
}

export async function HeaderNav({ className }: HeaderNavProps) {
  const header = await getHeaderRepository()
  if (!header?.id) return <HeaderNavSkeleton />
  return (
    <HeaderNavClient
      data={header}
      className={className}
      search={<SearchBar variant="header" />}
    >
      <Suspense fallback={<MobileNavSkeleton />}>
        <MobileNav />
      </Suspense>
    </HeaderNavClient>
  )
}
