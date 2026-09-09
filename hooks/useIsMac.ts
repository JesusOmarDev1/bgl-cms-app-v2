"use client"

import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return navigator.userAgent.includes("Mac")
}

function getServerSnapshot() {
  return false
}

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
