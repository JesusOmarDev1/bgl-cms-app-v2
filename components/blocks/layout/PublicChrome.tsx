import { Suspense } from "react"
import { HeaderNav } from "@/components/blocks/singletons/header/HeaderNav"
import { HeaderNavSkeleton } from "@/components/blocks/singletons/header/HeaderNavSkeleton"
import { FooterNav } from "@/components/blocks/singletons/footer/FooterNav"
import { FooterNavSkeleton } from "@/components/blocks/singletons/footer/FooterNavSkeleton"
import { ScrollToTopButton } from "@/components/shared/utility/ScrollToTopButton"
import { WhatsappBtn } from "@/components/blocks/singletons/whatsapp-btn/WhatsappBtn"
import { ServicesBtn } from "@/components/blocks/singletons/services-btn/ServicesBtn"

/**
 * Shared chrome of the public groups. The private area renders without it.
 * Health and debug pages keep the fixed header, so their groups render it too
 * (HeaderSpacer in those pages assumes it is present).
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        key="header-nav"
        name="header-nav"
        fallback={<HeaderNavSkeleton />}
      >
        <HeaderNav />
      </Suspense>
      <ServicesBtn className="fixed bottom-6 left-6 z-40" />
      <WhatsappBtn className="fixed right-6 bottom-6 z-40" />
      {children}
      <ScrollToTopButton className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2" />
      <Suspense
        key="footer-nav"
        name="footer-nav"
        fallback={<FooterNavSkeleton />}
      >
        <FooterNav />
      </Suspense>
    </>
  )
}
