"use client"

import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { usePrivateSettings, type MotionKey } from "./use-private-settings"

// The attribute itself is applied by PrivateSettingsApplier, mounted by the
// private layout, so the choice survives a reload even with this dialog closed.
export function AppearanceSettings() {
  const t = useTranslations("dashboard")
  const { settings, setSettings } = usePrivateSettings()

  const selectMotion = (reduce: boolean) => {
    const next: MotionKey = reduce ? "reduce" : "full"
    setSettings({ motion: next })
  }

  return (
    <div className="flex max-w-sm items-center justify-between gap-4">
      <div className="space-y-1">
        <label htmlFor="motion-reduce" className="block text-sm font-medium">
          {t("settings.motionLabel")}
        </label>
        <p id="motion-reduce-hint" className="text-xs text-muted-foreground">
          {t("settings.motionHint")}
        </p>
      </div>
      <Switch
        id="motion-reduce"
        aria-describedby="motion-reduce-hint"
        isSelected={settings?.motion === "reduce"}
        onChange={selectMotion}
      />
    </div>
  )
}
