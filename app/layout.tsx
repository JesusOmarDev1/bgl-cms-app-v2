import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"

import { cn } from "@/lib/utils"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
              {children}
              <Toaster
                richColors
                closeButton
                expand
                theme="dark"
                duration={2000}
                position="top-center"
              />
            </ThemeProvider>
            <GoogleAnalytics
              gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID! as string}
            />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
