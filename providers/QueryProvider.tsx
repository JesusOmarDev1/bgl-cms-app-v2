"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  // Keep server requests isolated and preserve the browser cache across renders.
  if (typeof window === "undefined") return new QueryClient()
  browserQueryClient ??= new QueryClient()
  return browserQueryClient
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}

export { QueryProvider }
