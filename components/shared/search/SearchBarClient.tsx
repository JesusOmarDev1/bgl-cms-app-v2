"use client"

import { useMutation } from "@tanstack/react-query"
import {
  hasServerError,
  mutationOptions,
} from "@next-safe-action/adapter-tanstack-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  CommandPalette,
  type CommandItem,
  type CommandPaletteStatus,
} from "@/components/shared/content/CommandPalette"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { toSearchCommandItem } from "@/components/shared/search/map-search-hit"
import { Kbd } from "@/components/ui/kbd"
import { useIsMac } from "@/hooks/useIsMac"
import { cn } from "cn"
import { searchAction } from "@/services/domain/server/search/search"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"
import { Button } from "@/components/ui/button"
import BorderBeam from "border-beam"

const MIN_QUERY_LENGTH = 3
const MAX_QUERY_LENGTH = 100
const SEARCH_DEBOUNCE_MS = 500

export type SearchBarVariant = "default" | "icon" | "header"

export type SearchBarClientProps = {
  variant?: SearchBarVariant
  className?: string
  portaled?: boolean
  onNavigate?: () => void
  onPaletteOpenChange?: (open: boolean) => void
}

function resolvePanelStatus(opts: {
  queryLength: number
  loading: boolean
  resultCount: number
  hasError: boolean
}): CommandPaletteStatus | undefined {
  if (opts.queryLength < MIN_QUERY_LENGTH) return "prompt"
  if (opts.loading) return "loading"
  if (opts.hasError) return "error"
  if (opts.resultCount === 0) return "empty"
  return undefined
}

type SearchState = {
  seqRef: React.MutableRefObject<number>
  timerRef: React.MutableRefObject<number>
  reset: () => void
  clearTimer: () => void
  setQuery: (query: string) => void
  setHits: (hits: SearchHitTypes[]) => void
  setHasError: (hasError: boolean) => void
  setWaiting: (waiting: boolean) => void
  mutateAsync: (input: { query: string }) => Promise<unknown>
}

function queueSearch(value: string, state: SearchState) {
  state.seqRef.current += 1
  state.reset()
  state.setQuery(value)
  state.clearTimer()
  state.setHits([])
  state.setHasError(false)
  state.setWaiting(false)
  const trimmed = value.trim()
  if (trimmed.length < MIN_QUERY_LENGTH || trimmed.length > MAX_QUERY_LENGTH) return

  state.setWaiting(true)
  state.timerRef.current = window.setTimeout(() => {
    const seq = ++state.seqRef.current
    void state.mutateAsync({ query: trimmed })
      .then((data) => {
        if (seq !== state.seqRef.current) return
        if (Array.isArray(data)) {
          state.setHits(data as SearchHitTypes[])
          state.setHasError(false)
          return
        }
        state.setHits([])
        state.setHasError(true)
      })
      .catch(() => {
        if (seq !== state.seqRef.current) return
        state.setHits([])
        state.setHasError(true)
      })
      .finally(() => {
        if (seq === state.seqRef.current) state.setWaiting(false)
      })
  }, SEARCH_DEBOUNCE_MS)
}

function getSearchItems(
  hits: SearchHitTypes[],
  onNavigate: (() => void) | undefined,
  navigate: (url: string) => void
): CommandItem[] {
  const items: CommandItem[] = []
  for (const hit of hits) {
    const mapped = toSearchCommandItem(hit)
    if (!mapped) continue
    items.push({
      ...mapped,
      onSelect: () => {
        onNavigate?.()
        navigate(hit.url)
      },
    })
  }
  return items
}

function getSearchStatusAnnouncement(
  loading: boolean,
  errorMessage: string | undefined,
  status: CommandPaletteStatus | undefined
) {
  if (loading) return "Buscando…"
  if (errorMessage) return errorMessage
  return status === "empty" ? "Sin resultados" : ""
}

function SearchBarTriggers({
  variant,
  className,
  loading,
  shortcutLabel,
  onOpen,
}: {
  variant: SearchBarVariant
  className?: string
  loading: boolean
  shortcutLabel: string
  onOpen: () => void
}) {
  const showIcon = variant === "icon" || variant === "header"
  const showDefault = variant === "default" || variant === "header"
  return (
    <>
      {showIcon ? (
        <BorderBeam size="md" colorVariant="mono">
          <Button
            variant="glass"
            size="icon-xl"
            aria-label="Buscar"
            aria-busy={loading}
            isDisabled={loading}
            className={cn("rounded-full", variant === "header" && "min-[1366px]:hidden", className)}
            onClick={onOpen}
          >
            <MaterialIcon name="search" size={20} className="text-foreground" />
          </Button>
        </BorderBeam>
      ) : null}
      {showDefault ? (
        <BorderBeam size="line" colorVariant="mono">
          <button
            type="button"
            aria-label="Buscar"
            aria-busy={loading}
            disabled={loading}
            className={cn("inline-flex h-11 items-center rounded-3xl border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm backdrop-blur-md transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none lg:w-32 2xl:w-44", variant === "header" && "hidden min-[1366px]:inline-flex", className)}
            onClick={onOpen}
          >
            <MaterialIcon name="search" size={16} className="me-2 shrink-0" />
            <span className="flex w-full items-center justify-between">
              <span className="font-normal text-muted-foreground/70">{loading ? "Buscando..." : "Buscar..."}</span>
              <Kbd className="hidden px-2 sm:flex">{shortcutLabel}</Kbd>
            </span>
          </button>
        </BorderBeam>
      ) : null}
    </>
  )
}

export function SearchBarClient({
  variant = "default",
  className,
  portaled = true,
  onNavigate,
  onPaletteOpenChange,
}: SearchBarClientProps) {
  const router = useRouter()
  const isMac = useIsMac()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHitTypes[]>([])
  const [hasError, setHasError] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const seqRef = useRef(0)
  const timerRef = useRef(0)

  const { mutateAsync, reset, error } = useMutation(
    mutationOptions(searchAction, { retry: false })
  )

  const clearTimer = () => {
    window.clearTimeout(timerRef.current)
  }

  const resetSearch = () => {
    clearTimer()
    seqRef.current += 1
    setQuery("")
    setHits([])
    setHasError(false)
    setWaiting(false)
    reset()
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onPaletteOpenChange?.(next)
    if (!next) resetSearch()
  }

  const handleQueryChange = (value: string) =>
    queueSearch(value, {
      seqRef,
      timerRef,
      reset,
      clearTimer,
      setQuery,
      setHits,
      setHasError,
      setWaiting,
      mutateAsync,
    })

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const items = getSearchItems(hits, onNavigate, (url) => router.push(url))

  const loading = waiting
  const status = resolvePanelStatus({
    queryLength: query.trim().length,
    loading,
    resultCount: hits.length,
    hasError,
  })

  const errorMessage = error
    ? hasServerError(error)
      ? String(error.serverError)
      : "Intenta de nuevo."
    : undefined

  const statusAnnouncement = getSearchStatusAnnouncement(
    loading,
    errorMessage,
    status
  )
  const shortcutLabel = isMac ? "⌘ K" : "Ctrl + K"

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>
      <SearchBarTriggers
        variant={variant}
        className={className}
        loading={loading}
        shortcutLabel={shortcutLabel}
        onOpen={() => handleOpenChange(true)}
      />

      <CommandPalette
        portaled={portaled}
        items={status ? [] : items}
        open={open}
        onOpenChange={handleOpenChange}
        onQueryChange={handleQueryChange}
        filterItems={false}
        status={status}
        placeholder="Buscar productos, servicios, páginas..."
        promptTitle="Busca en nuestro catálogo"
        promptDescription="Encuentra productos, servicios, publicaciones y más"
        emptyTitle="Sin resultados"
        emptyDescription="Intenta con otros términos de búsqueda"
        errorTitle="No se pudo buscar"
        errorMessage={errorMessage}
      />
    </>
  )
}
