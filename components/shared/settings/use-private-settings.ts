"use client"

import { useSyncExternalStore } from "react"

type MotionKey = "reduce" | "full"

type StoredSettings = {
  motion?: MotionKey
}

const STORAGE_KEY = "private-settings"
const MOTION_VALUES: readonly MotionKey[] = ["reduce", "full"]

const listeners = new Set<() => void>()
let revision = 0

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Reads the stored JSON: an unknown or invalid key is dropped instead of
 * breaking the rest, so a payload written before a preference was removed
 * (the old fontSize) still applies.
 */
export function parsePrivateSettings(
  raw: string | null
): StoredSettings | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const settings: StoredSettings = {}
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

/** Writes the whole preference set and wakes every mounted consumer. */
export function persistPrivateSettings(settings: StoredSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    revision += 1
    for (const listener of listeners) listener()
  } catch {
    // Private mode or full storage: preference stays for this page load only.
  }
}

function readStoredSettings(): StoredSettings | null {
  try {
    return parsePrivateSettings(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/** Mounted flag so localStorage is only read after hydration. */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
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
  // Re-read on every persist so each mounted consumer sees the new value.
  useSyncExternalStore(
    subscribe,
    () => revision,
    () => 0
  )
  const settings = mounted ? readStoredSettings() : null

  return {
    settings,
    setSettings: persistPrivateSettings,
    mounted,
  }
}

export type { MotionKey, StoredSettings }
