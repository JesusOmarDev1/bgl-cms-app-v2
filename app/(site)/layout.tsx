import "../globals.css"
import { NextIntlClientProvider } from "next-intl"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsentAnalytics } from "@/components/shared/utility/CookieConsentAnalytics"
import { preloadResources } from "@/lib/seo/preload-resources"
import { createRootMetadata } from "@/lib/seo/metadata"
import { cn } from "cn"
import { geist, geistMono } from "@/lib/fonts/geist"
import { Viewport } from "next"
import { Suspense } from "react"
import { HeaderNavSkeleton } from "@/components/blocks/singletons/header/HeaderNavSkeleton"
import { HeaderNav } from "@/components/blocks/singletons/header/HeaderNav"
import { ServicesBtn } from "@/components/blocks/singletons/services-btn/ServicesBtn"
import { WhatsappBtn } from "@/components/blocks/singletons/whatsapp-btn/WhatsappBtn"
import { ScrollToTopButton } from "@/components/shared/utility/ScrollToTopButton"
import { FooterNavSkeleton } from "@/components/blocks/singletons/footer/FooterNavSkeleton"
import { FooterNav } from "@/components/blocks/singletons/footer/FooterNav"

export const metadata = createRootMetadata()

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1.0,
  userScalable: true,
  colorScheme: "dark",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  width: "device-width",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  preloadResources()
  return (
    <html
      lang="es-MX"
      dir="ltr"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        `${geist.variable} ${geistMono.variable}`
      )}
    >
      <body>
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              forcedTheme="dark"
              storageKey="bgl-theme"
              enableSystem={false}
            >
              <Suspense
                key="header-nav"
                name="header-nav"
                fallback={<HeaderNavSkeleton />}
              >
                <HeaderNav />
              </Suspense>

              <NuqsAdapter>{children}</NuqsAdapter>
              <Toaster
                closeButton
                expand
                theme="dark"
                duration={1500}
                position="bottom-right"
              />
              <ServicesBtn className="fixed bottom-6 left-6 z-40" />
              <WhatsappBtn className="fixed right-6 bottom-6 z-40" />
              <ScrollToTopButton className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2" />
              <Suspense
                key="footer-nav"
                name="footer-nav"
                fallback={<FooterNavSkeleton />}
              >
                <FooterNav />
              </Suspense>
            </ThemeProvider>
            <CookieConsentAnalytics />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
