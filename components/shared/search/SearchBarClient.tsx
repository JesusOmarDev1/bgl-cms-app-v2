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
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { toSearchCommandItem } from "@/components/shared/search/map-search-hit"
import { Kbd } from "@/components/ui/kbd"
import { useIsMac } from "@/hooks/useIsMac"
import { cn } from "@/lib/utils"
import { searchAction } from "@/services/domain/server/search/search"
import type { SearchHitTypes } from "@/types/shared/search/search-hits"

const MIN_QUERY_LENGTH = 3
const MAX_QUERY_LENGTH = 100
const SEARCH_DEBOUNCE_MS = 500

export type SearchBarVariant = "default" | "icon" | "header"

export type SearchBarClientProps = {
  variant?: SearchBarVariant
  className?: string
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

export function SearchBarClient({
  variant = "default",
  className,
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

  const { mutateAsync, reset, isPending, error } = useMutation(
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
    if (!next) resetSearch()
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    clearTimer()
    const trimmed = value.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      seqRef.current += 1
      setHits([])
      setHasError(false)
      setWaiting(false)
      return
    }
    if (trimmed.length > MAX_QUERY_LENGTH) return
    setWaiting(true)
    timerRef.current = window.setTimeout(() => {
      const seq = ++seqRef.current
      void mutateAsync({ query: trimmed })
        .then((data) => {
          if (seq !== seqRef.current) return
          if (Array.isArray(data)) {
            setHits(data)
            setHasError(false)
            return
          }
          setHits([])
          setHasError(true)
        })
        .catch(() => {
          if (seq !== seqRef.current) return
          setHits([])
          setHasError(true)
        })
        .finally(() => {
          if (seq !== seqRef.current) return
          setWaiting(false)
        })
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const items: CommandItem[] = []
  for (const hit of hits) {
    const mapped = toSearchCommandItem(hit)
    if (!mapped) continue
    const url = hit.url
    items.push({
      ...mapped,
      onSelect: () => {
        router.push(url)
      },
    })
  }

  const loading = waiting || isPending
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

  const showIcon = variant === "icon" || variant === "header"
  const showDefault = variant === "default" || variant === "header"
  const shortcutLabel = isMac ? "⌘ K" : "Ctrl + K"

  return (
    <>
      {showIcon ? (
        <button
          type="button"
          aria-label="Buscar"
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
            variant === "header" && "lg:hidden",
            className
          )}
          onClick={() => handleOpenChange(true)}
        >
          <MaterialIcon name="search" size={20} />
        </button>
      ) : null}

      {showDefault ? (
        <button
          type="button"
          aria-label="Buscar"
          className={cn(
            "inline-flex h-11 items-center rounded-3xl border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm backdrop-blur-md transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none lg:w-48 2xl:w-56",
            variant === "header" && "hidden lg:inline-flex",
            className
          )}
          onClick={() => handleOpenChange(true)}
        >
          <MaterialIcon
            name="search"
            size={16}
            className="me-2 shrink-0 text-muted-foreground/80"
          />
          <span className="flex w-full items-center justify-between">
            <span className="font-normal text-muted-foreground/70">
              Buscar...
            </span>
            <Kbd className="hidden px-2 sm:flex">{shortcutLabel}</Kbd>
          </span>
        </button>
      ) : null}

      <CommandPalette
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
