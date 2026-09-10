"use client"

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react"
import { Search, type LucideIcon } from "lucide-react"
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { DirectusImage } from "@/components/shared/assets/DirectusImage"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchHitsSkeleton } from "@/components/shared/search/SearchHitsSkeleton"
import { Spinner } from "@/components/ui/spinner"
import { EASE_OUT } from "@/lib/search/ease"
import { useOnOpen } from "@/hooks/useOnOpen"
import { useRowCursor } from "@/hooks/useRowCursor"
import { useTouchCapable } from "@/hooks/useTouchCapable"
import { PresenceGate } from "@/lib/animation/presence-gate"
import { cn } from "@/lib/utils"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SafeHtml } from "./SafeHtml"

export type CommandPaletteStatus = "prompt" | "loading" | "error" | "empty"

export type CommandItem = {
  id: string
  label: string
  group?: string
  hint?: string
  keywords?: string[]
  icon?: LucideIcon
  badge?: ReactNode
  image?: string | null
  description?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  items: CommandItem[]
  /** Opens with Cmd/Ctrl + this key. Default: "k" */
  shortcut?: string
  placeholder?: string
  emptyMessage?: string
  errorMessage?: string
  promptTitle?: string
  promptDescription?: string
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onQueryChange?: (query: string) => void
  /** When false, skip local fuzzy matching (server already filtered). */
  filterItems?: boolean
  status?: CommandPaletteStatus
}

function fuzzyMatch(needle: string, hay: string) {
  if (!needle) return true
  needle = needle.toLowerCase()
  hay = hay.toLowerCase()
  let i = 0
  for (const ch of hay) {
    if (ch === needle[i]) i++
    if (i === needle.length) return true
  }
  return false
}

// Opened via a keyboard shortcut many times a day — entrance must read as
// instant. Tight spring, even faster exit.
const PANEL_SPRING = {
  type: "spring",
  stiffness: 560,
  damping: 40,
  mass: 0.5,
} as const

type CommandPaletteItemProps = {
  item: CommandItem
  index: number
  isActive: boolean
  hasIcons: boolean
  hasImages: boolean
  uid: string
  reduce: boolean
  onHover: (id: string) => void
  onPick: (item: CommandItem) => void
}

function PaletteStatusPanel({
  status,
  emptyMessage,
  errorMessage,
  promptTitle,
  promptDescription,
  emptyTitle,
  emptyDescription,
  errorTitle,
}: {
  status: CommandPaletteStatus
  emptyMessage: string
  errorMessage?: string
  promptTitle: string
  promptDescription: string
  emptyTitle: string
  emptyDescription: string
  errorTitle: string
}) {
  if (status === "loading") {
    return <SearchHitsSkeleton />
  }

  const copy =
    status === "error"
      ? {
          icon: "error",
          title: errorTitle,
          description: errorMessage ?? emptyMessage,
        }
      : status === "empty"
        ? {
            icon: "search_off",
            title: emptyTitle,
            description: emptyDescription,
          }
        : {
            icon: "search",
            title: promptTitle,
            description: promptDescription,
          }

  return (
    <Empty className="border-none bg-transparent py-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MaterialIcon
            name={copy.icon}
            size={18}
            className="text-muted-foreground"
          />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-medium">{copy.title}</EmptyTitle>
        <EmptyDescription className="text-xs">
          {copy.description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function CommandPaletteItemMedia({
  item,
  hasIcons,
  hasImages,
}: {
  item: CommandItem
  hasIcons: boolean
  hasImages: boolean
}) {
  const Icon = item.icon
  if (item.image) {
    return (
      <DirectusImage
        src={item.image}
        alt={item.label}
        variant="thumbnail"
        sizing="contained"
        width={80}
        height={80}
        quality={75}
        className="relative z-10 size-20 shrink-0 rounded-md bg-muted"
      />
    )
  }
  if (hasImages) {
    return (
      <span className="relative z-10 size-20 shrink-0 rounded-md bg-muted" />
    )
  }
  if (Icon) {
    return <Icon className="relative z-10 h-4 w-4" />
  }
  if (hasIcons) {
    return <span className="relative z-10 h-4 w-4" />
  }
  return null
}

function CommandPaletteItem({
  item,
  index,
  isActive,
  hasIcons,
  hasImages,
  uid,
  reduce,
  onHover,
  onPick,
}: CommandPaletteItemProps) {
  return (
    <button
      type="button"
      id={`${uid}-opt-${index}`}
      role="option"
      aria-selected={isActive}
      data-index={index}
      onMouseEnter={() => onHover(item.id)}
      onClick={() => onPick(item)}
      className={cn(
        "relative isolate flex w-full items-center gap-3 rounded-md px-2 py-2 text-start text-sm transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {isActive ? (
        <m.span
          layoutId={`${uid}-active`}
          className="absolute inset-0 z-0 rounded-md bg-primary/[0.05]"
          transition={
            reduce
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 480,
                  damping: 38,
                }
          }
        />
      ) : null}
      <CommandPaletteItemMedia
        item={item}
        hasIcons={hasIcons}
        hasImages={hasImages}
      />
      <span className="relative z-10 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 font-medium">{item.label}</span>
        {item.description ? (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            <SafeHtml
              className="text-sm text-muted-foreground"
              content={item.description}
            />
          </span>
        ) : null}
      </span>
      {item.badge ? (
        <span className="relative z-10 shrink-0">{item.badge}</span>
      ) : null}
      {item.hint ? (
        <kbd className="relative z-10 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {item.hint}
        </kbd>
      ) : null}
    </button>
  )
}

function CommandPaletteSearchField({
  status,
  inputRef,
  query,
  setQuery,
  onQueryChange,
  placeholder,
  uid,
  active,
  rowCount,
  canTouch,
}: {
  status: CommandPaletteStatus | undefined
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  setQuery: (query: string) => void
  onQueryChange: ((query: string) => void) | undefined
  placeholder: string
  uid: string
  active: number
  rowCount: number
  canTouch: boolean
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4">
      {status === "loading" ? (
        <Spinner className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Search className="h-4 w-4 text-muted-foreground" />
      )}
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          const next = e.target.value
          setQuery(next)
          onQueryChange?.(next)
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded="true"
        aria-busy={status === "loading"}
        aria-controls={`${uid}-list`}
        aria-activedescendant={
          !status && rowCount > 0 ? `${uid}-opt-${active}` : undefined
        }
        aria-autocomplete="list"
        className={cn(
          "h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground",
          canTouch && "text-base"
        )}
      />
    </div>
  )
}

function CommandPaletteResults({
  listRef,
  uid,
  status,
  emptyMessage,
  errorMessage,
  promptTitle,
  promptDescription,
  emptyTitle,
  emptyDescription,
  errorTitle,
  rows,
  grouped,
  active,
  hasIcons,
  hasImages,
  reduce,
  onHover,
  onPick,
}: {
  listRef: RefObject<HTMLDivElement | null>
  uid: string
  status: CommandPaletteStatus | undefined
  emptyMessage: string
  errorMessage: string | undefined
  promptTitle: string
  promptDescription: string
  emptyTitle: string
  emptyDescription: string
  errorTitle: string
  rows: CommandItem[]
  grouped: [string, CommandItem[]][]
  active: number
  hasIcons: boolean
  hasImages: boolean
  reduce: boolean
  onHover: (id: string | null) => void
  onPick: (item: CommandItem) => void
}) {
  let content: ReactNode
  if (status) {
    content = (
      <PaletteStatusPanel
        status={status}
        emptyMessage={emptyMessage}
        errorMessage={errorMessage}
        promptTitle={promptTitle}
        promptDescription={promptDescription}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        errorTitle={errorTitle}
      />
    )
  } else if (rows.length === 0) {
    content = (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  } else {
    content = grouped.map(([group, list]) => (
      <div key={group} className="mb-1 last:mb-0">
        <div
          aria-hidden
          className="px-2 py-1.5 text-sm font-semibold tracking-wider text-muted-foreground uppercase"
        >
          {group}
        </div>
        {list.map((it) => {
          const idx = rows.indexOf(it)
          const isActive = idx === active
          return (
            <CommandPaletteItem
              key={it.id}
              item={it}
              index={idx}
              isActive={isActive}
              hasIcons={hasIcons}
              hasImages={hasImages}
              uid={uid}
              reduce={reduce}
              onHover={onHover}
              onPick={onPick}
            />
          )
        })}
      </div>
    ))
  }

  return (
    <div
      ref={listRef}
      id={`${uid}-list`}
      role="listbox"
      aria-label="Commands"
      className="max-h-[60vh] [scrollbar-width:none] overflow-y-auto overscroll-contain p-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {content}
    </div>
  )
}

function CommandPaletteHotkeys() {
  return (
    <div className="hidden items-center justify-between border-t p-4 lg:flex">
      <KbdGroup className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <Kbd>
            <MaterialIcon name="arrow_upward" size={16} />
          </Kbd>
          <span className="text-xs font-semibold text-muted-foreground">
            Subir
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Kbd>
            <MaterialIcon name="arrow_downward" size={16} />
          </Kbd>
          <span className="text-xs font-semibold text-muted-foreground">
            Bajar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Kbd>
            <MaterialIcon name="space_bar" size={16} />
          </Kbd>
          <span className="text-xs font-semibold text-muted-foreground">
            Seleccionar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Kbd>ESC</Kbd>
          <span className="text-xs font-semibold text-muted-foreground">
            Cancelar
          </span>
        </div>
      </KbdGroup>
      <KbdGroup className="flex items-center gap-1.5">
        <Kbd>Ctrl + K</Kbd>
        <span className="text-xs font-semibold text-muted-foreground">
          Abrir buscador
        </span>
      </KbdGroup>
    </div>
  )
}

export function CommandPalette({
  items,
  shortcut = "k",
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  errorMessage,
  promptTitle = "Search",
  promptDescription = "Type to search.",
  emptyTitle = "No results found.",
  emptyDescription = "Try a different search.",
  errorTitle = "Search failed.",
  open: controlledOpen,
  onOpenChange,
  onQueryChange,
  filterItems = true,
  status,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const controlled = controlledOpen !== undefined
  const open = controlled ? controlledOpen : internalOpen
  const setOpen = useCallback(
    (v: boolean) => {
      if (!controlled) setInternalOpen(v)
      onOpenChange?.(v)
    },
    [controlled, onOpenChange]
  )

  const [query, setQuery] = useState("")
  const uid = useId()
  const reduce = useReducedMotion()
  const canTouch = useTouchCapable()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDownEvent = useEffectEvent((e: KeyboardEvent) => {
    if (
      (e.metaKey || e.ctrlKey) &&
      e.key.toLowerCase() === shortcut.toLowerCase()
    ) {
      e.preventDefault()
      setOpen(!open)
      return
    }
    if (e.key === "Escape" && open) {
      e.preventDefault()
      setOpen(false)
    }
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDownEvent(event)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    root.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      root.style.overflow = previousRootOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!filterItems || !query) return items
    return items.filter((it) => {
      const haystacks = [it.label, it.group ?? "", ...(it.keywords ?? [])]
      return haystacks.some((h) => fuzzyMatch(query, h))
    })
  }, [filterItems, items, query])

  const hasIcons = useMemo(() => items.some((it) => it.icon), [items])
  const hasImages = useMemo(() => items.some((it) => it.image), [items])

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    filtered.forEach((it) => {
      const g = it.group ?? "Results"
      const groupItems = map.get(g) ?? []
      groupItems.push(it)
      map.set(g, groupItems)
    })
    return Array.from(map.entries())
  }, [filtered])

  // Grouping reorders the list, so the rendered order is not the filtered
  // order whenever two groups interleave. Everything that has to agree on
  // "which row" — the highlight, the ids, Enter, the scroll — reads this one
  // array, so they cannot drift apart.
  const rows = useMemo(() => grouped.flatMap(([, list]) => list), [grouped])

  const { activeIndex: active, moveTo, moveActive } = useRowCursor(rows, query)

  useOnOpen(open, () => {
    setQuery("")
    moveTo(null)
  })

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      moveActive(1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const it = rows[active]
      if (it) {
        it.onSelect()
        setOpen(false)
      }
    }
  }

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-index="${active}"]`
    )
    el?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  // The portal host does not exist during the server pass.
  if (typeof document === "undefined") return null

  // Portaled to <body> so ancestors with transforms, filters, or fixed
  // positioning can't trap the overlay in their stacking context, and mounted
  // only while open. The chrome is two fixed siblings rather than one wrapper:
  // the backdrop spans the viewport edges but carries the scrim colour, and the
  // layer positioning the panel is inset off every edge. Both hang off
  // `PresenceGate`, so interaction releases in the same commit that starts the
  // exit rather than when it ends — `open` is already false for those frames.
  // See tests/fixed-overlay-edge-sampling.test.tsx.
  return createPortal(
    <LazyMotion features={domAnimation}>
      <AnimatePresence initial={false}>
        {open ? (
          <PresenceGate key="backdrop">
            {({ gate }) => (
              <m.button
                type="button"
                aria-label="Close command palette"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.12, ease: EASE_OUT },
                }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                {...gate}
                onClick={() => setOpen(false)}
                className="pointer-events-auto fixed inset-0 z-[100] bg-background/5 [backdrop-filter:blur(12px)_saturate(140%)] [-webkit-backdrop-filter:blur(12px)_saturate(140%)]"
              />
            )}
          </PresenceGate>
        ) : null}

        {open ? (
          <PresenceGate key="panel-layer">
            {({ isPresent, gate }) => (
              // The layer itself never takes pointer events, so it carries
              // `inert` alone rather than the gate's pointer-events value.
              <div
                inert={!isPresent}
                className="pointer-events-none fixed inset-x-4 top-[18vh] bottom-4 z-[100] flex items-start justify-center"
              >
                <m.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Command palette"
                  initial={{
                    opacity: 0,
                    y: reduce ? 0 : -8,
                    scale: reduce ? 1 : 0.97,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: reduce ? 0 : -8,
                    scale: reduce ? 1 : 0.97,
                    transition: { duration: 0.12, ease: EASE_OUT },
                  }}
                  transition={reduce ? { duration: 0.1 } : PANEL_SPRING}
                  {...gate}
                  onKeyDown={onKeyDown}
                  className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                >
                  <CommandPaletteSearchField
                    status={status}
                    inputRef={inputRef}
                    query={query}
                    setQuery={setQuery}
                    onQueryChange={onQueryChange}
                    placeholder={placeholder}
                    uid={uid}
                    active={active}
                    rowCount={rows.length}
                    canTouch={canTouch}
                  />
                  <CommandPaletteResults
                    listRef={listRef}
                    uid={uid}
                    status={status}
                    emptyMessage={emptyMessage}
                    errorMessage={errorMessage}
                    promptTitle={promptTitle}
                    promptDescription={promptDescription}
                    emptyTitle={emptyTitle}
                    emptyDescription={emptyDescription}
                    errorTitle={errorTitle}
                    rows={rows}
                    grouped={grouped}
                    active={active}
                    hasIcons={hasIcons}
                    hasImages={hasImages}
                    reduce={Boolean(reduce)}
                    onHover={moveTo}
                    onPick={(picked) => {
                      picked.onSelect()
                      setOpen(false)
                    }}
                  />
                  <CommandPaletteHotkeys />
                </m.div>
              </div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>
    </LazyMotion>,
    document.body
  )
}
