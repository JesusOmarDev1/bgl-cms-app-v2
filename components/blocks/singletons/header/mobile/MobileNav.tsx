import { getHeaderRepository } from "@/services/domain/db/repositories/singletons/header"
import { MobileNavClient } from "./MobileNavClient"
import { MobileNavSkeleton } from "./MobileNavSkeleton"

export async function MobileNav() {
  const header = await getHeaderRepository()
  if (!header?.id) return <MobileNavSkeleton />
  return <MobileNavClient data={header} />
}
