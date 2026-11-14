"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DEFAULT_SETTINGS,
  FONT_SIZES,
  MOTION_VALUES,
  useIsMounted,
  usePrivateSettings,
  type FontSizeKey,
  type MotionKey,
} from "./use-private-settings"

// Segmented font-size control: one row, equal thirds, subtle token selection
// (no solid fill; the brand red stays reserved for the red button variant).
// h-auto! cancels the list's group-data-horizontal h-8, which otherwise
// clips the larger trigger labels out of the track.

// shortcut: stored preferences are read after hydration, so there is a brief
// flash of the default font size on load; upgrade by inlining a
// pre-hydration script in the root layout.
export function AppearanceSettings() {
  const t = useTranslations("dashboard")
  const { settings, setSettings } = usePrivateSettings()

  // User choice for this page load; null until a control is toggled.
  const [fontSize, setFontSize] = useState<FontSizeKey | null>(null)
  const [motion, setMotion] = useState<MotionKey | null>(null)

  const activeFontSize: FontSizeKey =
    fontSize ?? settings?.fontSize ?? DEFAULT_SETTINGS.fontSize
  const activeMotion: MotionKey | null = motion ?? settings?.motion ?? null

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-font-size", activeFontSize)
    // "reduce" forces reduced motion; anything else removes the attribute so
    // the OS prefers-reduced-motion media query decides on its own.
    if (activeMotion === "reduce") {
      root.setAttribute("data-motion", "reduce")
    } else {
      root.removeAttribute("data-motion")
    }
  }, [activeFontSize, activeMotion])

  const selectFontSize = (key: React.Key) => {
    const next = String(key) as FontSizeKey
    setFontSize(next)
    setSettings({ fontSize: next, motion: activeMotion ?? undefined })
  }

  const selectMotion = (reduce: boolean) => {
    const next: MotionKey = reduce ? "reduce" : "full"
    setMotion(next)
    setSettings({ fontSize: activeFontSize, motion: next })
  }

  return (
    <div className="flex max-w-sm flex-col gap-8">
      <Tabs
        selectedKey={activeFontSize}
        onSelectionChange={selectFontSize}
        data-slot="settings-font-size"
      >
        <TabsList
          aria-label={t("settings.fontSizeLabel")}
          className="grid h-auto! w-full grid-cols-3 gap-1 rounded-xl bg-muted/40 p-1 text-center"
        >
          {FONT_SIZES.map((key) => (
            <TabsTrigger
              key={key}
              id={key}
              className="text-center group-data-vertical/tabs:justify-center data-selected:bg-primary/10 data-selected:text-foreground! dark:data-selected:bg-primary/15"
            >
              {t(
                `settings.fontSize${key === "small" ? "Small" : key === "large" ? "Large" : "Default"}`
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex items-center justify-between gap-4">
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
          isSelected={activeMotion === "reduce"}
          onChange={selectMotion}
        />
      </div>
    </div>
  )
}
