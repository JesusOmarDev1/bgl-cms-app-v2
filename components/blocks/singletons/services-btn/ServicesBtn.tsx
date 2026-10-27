import { Suspense } from "react"
import { ServicesBtnClient } from "./ServicesBtnClient"
import { getServicesButtonRepository } from "@/services/domain/db/repositories/singletons/services-button"
import { ServicesBtnSkeleton } from "./ServicesBtnSkeleton"

export async function ServicesBtn({ className }: { className?: string }) {
  const data = await getServicesButtonRepository()
  if (!data?.id) return null
  return (
    <Suspense fallback={<ServicesBtnSkeleton />}>
      <ServicesBtnClient data={data} className={className} />
    </Suspense>
  )
}
