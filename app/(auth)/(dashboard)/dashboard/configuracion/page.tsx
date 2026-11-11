import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { getIdentityRepository } from "@/services/domain/db/repositories/collections/session"
import { readAuthSession } from "@/services/domain/server/auth/token"
import type { SessionIdentityTypes } from "@/types/collections/session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppearanceSettings } from "@/components/shared/settings/AppearanceSettings"
import { ProfileForm } from "@/components/shared/settings/ProfileForm"

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false, follow: false },
}

function ProfileReadonly({
  identity,
  t,
  ta,
}: {
  identity: SessionIdentityTypes
  t: Awaited<ReturnType<typeof getTranslations>>
  ta: Awaited<ReturnType<typeof getTranslations>>
}) {
  return (
    <div className="max-w-sm space-y-1 text-sm">
      <p className="font-medium">
        {[identity.first_name, identity.last_name].filter(Boolean).join(" ") ||
          ta("identityUnavailable")}
      </p>
      {identity.title ? (
        <p className="text-muted-foreground">{identity.title}</p>
      ) : null}
      <p className="text-muted-foreground">
        {ta("emailLabel")}: {identity.email ?? "—"}
      </p>
      {identity.location ? (
        <p className="text-muted-foreground">
          {t("settings.profileLocation")}: {identity.location}
        </p>
      ) : null}
      {identity.description ? (
        <p className="text-muted-foreground">
          {t("settings.profileDescription")}: {identity.description}
        </p>
      ) : null}
      {identity.tags && identity.tags.length > 0 ? (
        <p className="text-muted-foreground">
          {t("settings.profileTags")}: {identity.tags.join(", ")}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {t("settings.profileReadonly")}
      </p>
    </div>
  )
}

async function SettingsContent() {
  const [t, ta, session] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("auth"),
    readAuthSession(),
  ])
  if (!session) redirect("/login")

  const identity = session.accessToken
    ? await getIdentityRepository({ accessToken: session.accessToken })
    : null

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 md:py-10">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">
          {t("settings.title")}
        </h1>
      </header>

      <Tabs>
        <TabsList aria-label={t("settings.title")}>
          <TabsTrigger id="apariencia">
            {t("settings.appearanceSection")}
          </TabsTrigger>
          <TabsTrigger id="perfil">{t("settings.profileSection")}</TabsTrigger>
        </TabsList>

        <TabsContent id="apariencia" className="space-y-6 pt-6">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent id="perfil" className="space-y-6 pt-6">
          {identity ? (
            <ProfileReadonly identity={identity} t={t} ta={ta} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {ta("identityUnavailable")}
            </p>
          )}

          {identity ? (
            <ProfileForm
              identity={{
                firstName: identity.first_name ?? "",
                lastName: identity.last_name ?? "",
                title: identity.title ?? "",
                location: identity.location ?? "",
                description: identity.description ?? "",
                tags: identity.tags ?? [],
              }}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  )
}
