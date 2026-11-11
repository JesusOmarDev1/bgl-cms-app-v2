import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { LogoutButton } from "@/components/shared/auth/LogoutButton"
import { RefreshSession } from "@/components/shared/auth/RefreshSession"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { readAuthSession } from "@/services/domain/server/auth/token"
import { getIdentityRepository } from "@/services/domain/db/repositories/collections/session"
import type { SessionIdentityTypes } from "@/types/collections/session"

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
}

function initials(identity: SessionIdentityTypes) {
  const source =
    `${identity.first_name ?? ""} ${identity.last_name ?? ""}`.trim()
  return source
    ? source
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : (identity.email?.[0]?.toUpperCase() ?? "?")
}

const LAST_ACCESS_FORMAT = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatLastAccess(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return LAST_ACCESS_FORMAT.format(date)
}

async function SessionCard() {
  const [t, te, session] = await Promise.all([
    getTranslations("auth"),
    getTranslations("directusErrors"),
    readAuthSession(),
  ])
  if (!session) redirect("/login")

  const identity = session.accessToken
    ? await getIdentityRepository({ accessToken: session.accessToken })
    : null

  const name = identity
    ? [identity.first_name, identity.last_name].filter(Boolean).join(" ")
    : ""
  const lastAccess = formatLastAccess(identity?.last_access ?? null)

  return (
    <section className="flex w-full max-w-md flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
      <header className="flex items-center gap-4">
        <Avatar className="size-14 border">
          <AvatarFallback className="font-heading text-lg font-semibold">
            {identity ? initials(identity) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-xl font-semibold">
            {name || t("identityUnavailable")}
          </h1>
          {identity?.title ? (
            <p className="truncate text-sm text-muted-foreground">
              {identity.title}
            </p>
          ) : null}
        </div>
      </header>

      {identity ? (
        <dl className="grid gap-3 rounded-lg border bg-background/50 p-4 text-sm">
          <div className="flex items-center gap-3">
            <MaterialIcon
              className="text-muted-foreground"
              name="mail"
              size={18}
            />
            <dt className="sr-only">{t("emailLabel")}</dt>
            <dd className="min-w-0 truncate font-medium">
              {identity.email ?? "—"}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <MaterialIcon
              className="text-muted-foreground"
              name="schedule"
              size={18}
            />
            <dt className="text-muted-foreground">{t("lastAccessLabel")}</dt>
            <dd className="ml-auto font-medium">{lastAccess ?? "—"}</dd>
          </div>
        </dl>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {te("unavailable")}
        </p>
      )}

      <footer className="flex gap-3">
        <RefreshSession />
        <LogoutButton />
      </footer>
    </section>
  )
}

function SessionCardSkeleton() {
  return (
    <div
      aria-busy
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-8"
    >
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="h-9 w-32 animate-pulse rounded bg-muted" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <main className="flex min-h-[calc(100svh-3rem)] flex-1 flex-col items-center justify-center p-6 md:p-10">
      <Suspense fallback={<SessionCardSkeleton />}>
        <SessionCard />
      </Suspense>
    </main>
  )
}
