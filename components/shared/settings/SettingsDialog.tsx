"use client"

import { useTranslations } from "next-intl"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { AppearanceSettings } from "@/components/shared/settings/AppearanceSettings"
import { ThemeSchemePicker } from "@/components/shared/settings/ThemeSchemePicker"
import { ProfileForm } from "@/components/shared/settings/ProfileForm"
import type { SessionIdentityTypes } from "@/types/collections/session"

// Identity feeds ProfileForm; the server layout already resolved it, so the
// dialog opens instantly and degrades to a notice when it is unavailable.
function ProfileSection({
  identity,
}: {
  identity: SessionIdentityTypes | null
}) {
  const t = useTranslations("dashboard")
  const ta = useTranslations("auth")

  if (!identity) {
    return (
      <p className="text-sm text-muted-foreground">
        {ta("identityUnavailable")}
      </p>
    )
  }

  return (
    <ProfileForm
      identity={{
        firstName: identity.first_name ?? "",
        lastName: identity.last_name ?? "",
        title: identity.title ?? "",
        location: identity.location ?? "",
        description: identity.description ?? "",
        avatar: identity.avatar ?? null,
      }}
    />
  )
}

export function SettingsDialog({
  identity,
  isOpen,
  onOpenChange,
}: {
  identity: SessionIdentityTypes | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("dashboard")

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"
    >
      <DialogHeader className="px-1">
        <DialogTitle>{t("settings.title")}</DialogTitle>
      </DialogHeader>
      <Tabs
        orientation="vertical"
        className="flex flex-col gap-6 md:flex-row md:gap-8"
      >
        <TabsList
          aria-label={t("settings.title")}
          className="w-full shrink-0 gap-1 rounded-xl bg-muted/40 p-1 md:w-44"
        >
          <TabsTrigger
            id="apariencia"
            className="min-h-10 justify-start gap-2 rounded-lg px-3 py-2 data-selected:bg-secondary! dark:data-selected:bg-secondary!"
          >
            <MaterialIcon name="palette" size={20} />
            {t("settings.appearanceSection")}
          </TabsTrigger>
          <TabsTrigger
            id="perfil"
            className="min-h-10 justify-start gap-2 rounded-lg px-3 py-2 data-selected:bg-secondary! dark:data-selected:bg-secondary!"
          >
            <MaterialIcon name="person" size={20} />
            {t("settings.profileSection")}
          </TabsTrigger>
        </TabsList>
        <TabsContent id="apariencia" className="min-w-0 flex-1 space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">{t("settings.colorScheme")}</h3>
            <ThemeSchemePicker />
          </section>
          <AppearanceSettings />
        </TabsContent>
        <TabsContent id="perfil" className="min-w-0 flex-1">
          <ProfileSection identity={identity} />
        </TabsContent>
      </Tabs>
    </Dialog>
  )
}
