"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FontSizeKey = "small" | "default" | "large"
type MotionKey = "reduce" | "full"

const STORAGE_KEY = "private-settings"
const FONT_SIZES: readonly FontSizeKey[] = ["small", "default", "large"]
const MOTION_VALUES: readonly MotionKey[] = ["reduce", "full"]

type StoredSettings = {
  fontSize?: FontSizeKey
  motion?: MotionKey
}

function readStoredSettings(): StoredSettings | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const settings: StoredSettings = {}
    if (
      typeof parsed.fontSize === "string" &&
      (FONT_SIZES as readonly string[]).includes(parsed.fontSize)
    ) {
      settings.fontSize = parsed.fontSize as FontSizeKey
    }
    if (
      typeof parsed.motion === "string" &&
      (MOTION_VALUES as readonly string[]).includes(parsed.motion)
    ) {
      settings.motion = parsed.motion as MotionKey
    }
    return settings
  } catch {
    return null
  }
}

function persist(settings: StoredSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Private mode or full storage: preference stays for this page load only.
  }
}

const subscribeNever = () => () => {}

// Segmented font-size control: one row, equal thirds, subtle token selection
// (no solid fill; the brand red stays reserved for the red button variant).
const SEGMENT_LIST_CLASS = "grid w-full grid-cols-3 rounded-xl"
const SEGMENT_TRIGGER_CLASS =
  "data-selected:bg-primary/10 data-selected:text-foreground dark:data-selected:bg-primary/15"

// shortcut: stored preferences are read after hydration, so there is a brief
// flash of the default font size on load; upgrade by inlining a
// pre-hydration script in the root layout.
export function AppearanceSettings() {
  const t = useTranslations("dashboard")
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )

  // Pure function of localStorage; read once in the post-hydration render.
  const stored = useMemo(
    () => (mounted ? readStoredSettings() : null),
    [mounted]
  )

  // User choice for this page load; null until a control is toggled.
  const [fontSize, setFontSize] = useState<FontSizeKey | null>(null)
  const [motion, setMotion] = useState<MotionKey | null>(null)

  const activeFontSize: FontSizeKey = fontSize ?? stored?.fontSize ?? "default"
  const activeMotion: MotionKey | null = motion ?? stored?.motion ?? null

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
    persist({ fontSize: next, motion: activeMotion ?? undefined })
  }

  const selectMotion = (reduce: boolean) => {
    const next: MotionKey = reduce ? "reduce" : "full"
    setMotion(next)
    persist({ fontSize: activeFontSize, motion: next })
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
          className={SEGMENT_LIST_CLASS}
        >
          <span className="sr-only">{t("settings.fontSizeLabel")}</span>
          <TabsTrigger id="small" className={SEGMENT_TRIGGER_CLASS}>
            {t("settings.fontSizeSmall")}
          </TabsTrigger>
          <TabsTrigger id="default" className={SEGMENT_TRIGGER_CLASS}>
            {t("settings.fontSizeDefault")}
          </TabsTrigger>
          <TabsTrigger id="large" className={SEGMENT_TRIGGER_CLASS}>
            {t("settings.fontSizeLarge")}
          </TabsTrigger>
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
