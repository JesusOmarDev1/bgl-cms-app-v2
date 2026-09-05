import "./globals.css"
import { GoogleAnalytics } from "@next/third-parties/google"
import { NextIntlClientProvider } from "next-intl"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { preloadResources } from "@/lib/seo/preload-resources"
import { cn } from "@/lib/utils"
import { geist, geistMono } from "@/lib/fonts/geist"
import { Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1.0,
  userScalable: true,
  colorScheme: "dark",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  width: "device-width",
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""

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
              <NuqsAdapter>{children}</NuqsAdapter>
              <Toaster
                richColors
                closeButton
                expand
                theme="dark"
                duration={2000}
                position="top-center"
              />
            </ThemeProvider>
            {GA_MEASUREMENT_ID ? (
              <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
            ) : null}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
