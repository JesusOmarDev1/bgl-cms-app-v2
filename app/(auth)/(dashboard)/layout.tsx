import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import {
  AppSidebar,
  SidebarUserFallback,
  UserMenu,
} from "@/components/blocks/app/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { readAuthSession } from "@/services/domain/server/auth/token"
import { getIdentityRepository } from "@/services/domain/db/repositories/collections/session"
import { getInitials } from "@/lib/formatting/initials"
import { ThemeToggle } from "@/components/shared/theme/ThemeToggle"
import type { SessionIdentityTypes } from "@/types/collections/session"

async function SidebarUser() {
  const session = await readAuthSession()
  if (!session) redirect("/login")

  const identity = session.accessToken
    ? await getIdentityRepository({ accessToken: session.accessToken })
    : null

  const name = identity
    ? [identity.first_name, identity.last_name].filter(Boolean).join(" ")
    : ""
  const email = identity?.email ?? ""

  return (
    <UserMenu
      name={name}
      email={email}
      initials={
        identity ? getInitials(identity.first_name, identity.last_name) : "?"
      }
      avatar={identity?.avatar ?? null}
      identity={identity}
    />
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [t] = await Promise.all([getTranslations("app")])

  return (
    <SidebarProvider>
      <a
        href="#sidebar-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        {t("skipToContent")}
      </a>
      <AppSidebar
        user={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      />
      <SidebarInset id="sidebar-content">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger aria-label={t("toggleSidebar")} />
          <ThemeToggle className="ms-auto" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
