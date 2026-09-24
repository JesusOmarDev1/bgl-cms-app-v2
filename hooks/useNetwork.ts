"use client"

import { useSyncExternalStore } from "react"

export type NetworkState = {
  online: boolean
  downlink?: number
  rtt?: number
  saveData?: boolean
}

type NetworkConnection = EventTarget & {
  downlink?: number
  rtt?: number
  saveData?: boolean
}

const SERVER_SNAPSHOT: NetworkState = { online: true }

let clientSnapshot: NetworkState | null = null

function getConnection(): NetworkConnection | null {
  if (typeof navigator !== "object") {
    return null
  }
  const connection = (
    navigator as Navigator & { connection?: NetworkConnection }
  ).connection
  return connection ?? null
}

function readConnectionFields(): Pick<
  NetworkState,
  "downlink" | "rtt" | "saveData"
> {
  const connection = getConnection()
  if (!connection) {
    return {}
  }
  return {
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  }
}

function readClientSnapshot(): NetworkState {
  return {
    online: navigator.onLine,
    ...readConnectionFields(),
  }
}

function getSnapshot(): NetworkState {
  if (clientSnapshot === null) {
    clientSnapshot = readClientSnapshot()
  }
  return clientSnapshot
}

function getServerSnapshot(): NetworkState {
  return SERVER_SNAPSHOT
}

function subscribe(onStoreChange: () => void): () => void {
  const notify = (online: boolean) => {
    clientSnapshot = {
      online,
      ...readConnectionFields(),
    }
    onStoreChange()
  }

  const onOnline = () => notify(true)
  const onOffline = () => notify(false)
  const onConnectionChange = () => notify(navigator.onLine)

  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)

  const connection = getConnection()
  connection?.addEventListener("change", onConnectionChange)

  return () => {
    window.removeEventListener("online", onOnline)
    window.removeEventListener("offline", onOffline)
    connection?.removeEventListener("change", onConnectionChange)
  }
}

export function useNetwork(): NetworkState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
