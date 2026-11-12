import "./globals.css"
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
              storageKey="bgl-theme"
            >
              <NuqsAdapter>{children}</NuqsAdapter>
              <Toaster
                closeButton
                expand
                theme="dark"
                duration={1500}
                position="bottom-right"
              />
            </ThemeProvider>
            <CookieConsentAnalytics />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
