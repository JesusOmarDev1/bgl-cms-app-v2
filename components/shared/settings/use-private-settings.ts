"use client"

import { useSyncExternalStore } from "react"

type FontSizeKey = "small" | "default" | "large"
type MotionKey = "reduce" | "full"

type StoredSettings = {
  fontSize?: FontSizeKey
  motion?: MotionKey
}

const STORAGE_KEY = "private-settings"
const FONT_SIZES: readonly FontSizeKey[] = ["small", "default", "large"]
const MOTION_VALUES: readonly MotionKey[] = ["reduce", "full"]

const subscribeNever = () => () => {}

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

/** Mounted flag so localStorage is only read after hydration. */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
}

export type PrivateSettings = Required<StoredSettings>

const DEFAULT_SETTINGS: PrivateSettings = {
  fontSize: "default",
  motion: "full",
}

/**
 * Single source for the private-area device preferences (localStorage
 * "private-settings"). Returns null before hydration and null after a
 * failed read, so callers fall back to their own defaults.
 */
export function usePrivateSettings(): {
  settings: StoredSettings | null
  setSettings: (next: StoredSettings) => void
  mounted: boolean
} {
  const mounted = useIsMounted()
  // Pure function of localStorage; read once in the post-hydration render.
  const settings = mounted ? readStoredSettings() : null

  return {
    settings,
    setSettings: persist,
    mounted,
  }
}

export { DEFAULT_SETTINGS, FONT_SIZES, MOTION_VALUES }
export type { FontSizeKey, MotionKey }
