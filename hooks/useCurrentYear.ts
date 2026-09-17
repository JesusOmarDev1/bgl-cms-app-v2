"use client"

import { useSyncExternalStore } from "react"

function subscribe(): () => void {
  return () => {}
}

function getClientYear(): number {
  return new Date().getFullYear()
}

function getServerYear(): number {
  return 0
}

export function useCurrentYear() {
  return useSyncExternalStore(subscribe, getClientYear, getServerYear)
}
