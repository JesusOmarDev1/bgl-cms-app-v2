import { getWhatsappButtonRepository } from "@/services/domain/db/repositories/singletons/whatsapp-button"
import { WhatsappBtnClient } from "./WhatsappBtnClient"
import { WhatsappBtnSkeleton } from "./WhatsappBtnSkeleton"
import { Suspense } from "react"

export async function WhatsappBtn({ className }: { className: string }) {
  const data = await getWhatsappButtonRepository()
  if (!data?.url) return null
  return (
    <Suspense fallback={<WhatsappBtnSkeleton />}>
      <WhatsappBtnClient data={data} className={className} />
    </Suspense>
  )
}
