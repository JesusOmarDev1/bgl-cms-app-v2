"use client"

import { useSyncExternalStore } from "react"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true })
  return () => window.removeEventListener("scroll", onStoreChange)
}

function getServerSnapshot() {
  return false
}

export function useScroll(threshold: number) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    getServerSnapshot
  )
}
