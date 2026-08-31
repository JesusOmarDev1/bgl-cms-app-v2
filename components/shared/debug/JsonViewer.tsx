"use client"

import * as React from "react"
import {
  Check,
  ChevronRight,
  Copy,
  CopyPlus,
  Search,
  UnfoldHorizontal,
  FoldHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  jsonThemes,
  type JsonColorTheme,
  type ShikiThemeName,
} from "@/lib/debug/themes"

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const ThemeContext = React.createContext<JsonColorTheme | null>(null)

function useThemeColors(): JsonColorTheme | null {
  return React.use(ThemeContext)
}

type JsonViewerLabels = {
  search: string
  expandAll: string
  collapseAll: string
  copy: string
  item: string
  items: string
  key: string
  keys: string
  closeSearch: string
  clearSearch: string
  searchPlaceholder: string
  searchInputLabel: string
  copyPath: string
  expand: string
  collapse: string
}

const DEFAULT_JSON_VIEWER_LABELS: JsonViewerLabels = {
  search: "Search",
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  copy: "Copy JSON",
  item: "item",
  items: "items",
  key: "key",
  keys: "keys",
  closeSearch: "Close search",
  clearSearch: "Clear search",
  searchPlaceholder: "Filter keys and values…",
  searchInputLabel: "Filter keys and values",
  copyPath: "Copy path",
  expand: "Expand",
  collapse: "Collapse",
}

const LabelsContext = React.createContext<JsonViewerLabels>(
  DEFAULT_JSON_VIEWER_LABELS
)

function useViewerLabels(): JsonViewerLabels {
  return React.use(LabelsContext)
}

const COPY_FLASH_MS = 1500

const chromeButtonClassName =
  "inline-flex size-10 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

function useTimedFlag(durationMs: number): {
  active: boolean
  trigger: () => void
} {
  const [active, setActive] = React.useState(false)
  const frameRef = React.useRef<number | null>(null)

  const clearFrame = React.useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const trigger = React.useCallback(() => {
    setActive(true)
    clearFrame()
    const startedAt = performance.now()
    const tick = (now: number) => {
      if (now - startedAt >= durationMs) {
        setActive(false)
        frameRef.current = null
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [clearFrame, durationMs])

  React.useEffect(() => clearFrame, [clearFrame])

  return { active, trigger }
}

function typeOf(value: JsonValue): string {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value
}

function countEntries(value: JsonValue): number {
  if (Array.isArray(value)) return value.length
  if (value !== null && typeof value === "object")
    return Object.keys(value).length
  return 0
}

function buildPath(parent: string, key: string | number): string {
  if (parent === "") return String(key)
  if (typeof key === "number") return `${parent}[${key}]`
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return `${parent}.${key}`
  return `${parent}["${key}"]`
}

function matchesSearch(
  key: string | number,
  value: JsonValue,
  query: string
): boolean {
  const q = query.toLowerCase()
  if (String(key).toLowerCase().includes(q)) return true
  if (value === null) return "null".includes(q)
  if (typeof value !== "object") return String(value).toLowerCase().includes(q)
  return false
}

function hasSearchMatch(
  value: JsonValue,
  key: string | number,
  query: string
): boolean {
  if (!query) return false
  if (matchesSearch(key, value, query)) return true
  if (value !== null && typeof value === "object") {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [i, v] as const)
      : Object.entries(value)
    return entries.some(([k, v]) => hasSearchMatch(v, k, query))
  }
  return false
}

function TokenSpan({
  token,
  children,
  className,
  italic,
}: {
  token: keyof JsonColorTheme
  children: React.ReactNode
  className?: string
  italic?: boolean
}) {
  const theme = useThemeColors()

  if (theme) {
    return (
      <span
        style={{
          color: theme[token],
          fontStyle: italic ? "italic" : undefined,
        }}
        className={className}
      >
        {children}
      </span>
    )
  }

  const fallbackMap: Record<string, string> = {
    key: "text-violet-600 dark:text-violet-400",
    string: "text-emerald-600 dark:text-emerald-400",
    number: "text-sky-600 dark:text-sky-400",
    boolean: "text-amber-600 dark:text-amber-400",
    null: "text-muted-foreground/60",
    punctuation: "text-muted-foreground",
    fg: "",
    bg: "",
  }

  return (
    <span className={cn(fallbackMap[token], italic && "italic", className)}>
      {children}
    </span>
  )
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>

  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-amber-200/60 px-0.5 text-inherit dark:bg-amber-500/30">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface JsonNodeProps {
  keyName: string | number
  value: JsonValue
  path: string
  depth: number
  defaultExpanded: number | true
  searchQuery: string
  collapsedPaths: Set<string>
  onToggle: (path: string) => void
  isLast: boolean
}

function JsonNode({
  keyName,
  value,
  path,
  depth,
  defaultExpanded,
  searchQuery,
  collapsedPaths,
  onToggle,
  isLast,
}: JsonNodeProps) {
  const theme = useThemeColors()
  const type = typeOf(value)
  const isExpandable = type === "object" || type === "array"
  const count = isExpandable ? countEntries(value) : 0

  const isCollapsed = collapsedPaths.has(path)
  const isExpanded = isExpandable && !isCollapsed

  const openBracket = type === "array" ? "[" : "{"
  const closeBracket = type === "array" ? "]" : "}"
  const comma = isLast ? "" : ","

  const nodeMatches = searchQuery && matchesSearch(keyName, value, searchQuery)

  const handleToggle = React.useCallback(() => {
    if (isExpandable) onToggle(path)
  }, [isExpandable, onToggle, path])

  const labels = useViewerLabels()
  const { active: pathCopied, trigger: flashPathCopied } =
    useTimedFlag(COPY_FLASH_MS)

  const handleCopyPath = React.useCallback(() => {
    navigator.clipboard.writeText(path).then(() => {
      flashPathCopied()
    })
  }, [flashPathCopied, path])

  const hoverBg = theme ? `${theme.fg}10` : undefined

  const rowClass = cn(
    "group flex items-center gap-0 py-px",
    !theme && "hover:bg-muted/40",
    !theme && nodeMatches && "bg-amber-100/40 dark:bg-amber-900/20"
  )

  const rowStyle: React.CSSProperties = {
    paddingLeft: `${depth * 20 + 8}px`,
    ...(theme && nodeMatches ? { backgroundColor: `${theme.fg}15` } : {}),
  }

  const copyIconClass = cn(
    "ml-1 inline-flex items-center justify-center rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    theme
      ? "opacity-0 group-hover:opacity-60 hover:!opacity-100"
      : "text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground focus-visible:text-muted-foreground"
  )

  function renderKey() {
    return (
      <TokenSpan token="key">
        {typeof keyName === "string" ? (
          <>
            &quot;
            <HighlightMatch text={keyName} query={searchQuery} />
            &quot;
          </>
        ) : (
          keyName
        )}
      </TokenSpan>
    )
  }

  function renderValue() {
    if (typeof value === "string") {
      return (
        <TokenSpan token="string">
          &quot;
          <HighlightMatch text={value} query={searchQuery} />
          &quot;
        </TokenSpan>
      )
    }
    if (value === null) {
      return (
        <TokenSpan token="null" italic>
          {searchQuery ? (
            <HighlightMatch text="null" query={searchQuery} />
          ) : (
            "null"
          )}
        </TokenSpan>
      )
    }
    if (typeof value === "number") {
      return (
        <TokenSpan token="number">
          <HighlightMatch text={String(value)} query={searchQuery} />
        </TokenSpan>
      )
    }
    if (typeof value === "boolean") {
      return (
        <TokenSpan token="boolean">
          <HighlightMatch text={String(value)} query={searchQuery} />
        </TokenSpan>
      )
    }
    return <span>{String(value)}</span>
  }

  if (!isExpandable) {
    return (
      <div
        className={rowClass}
        style={rowStyle}
        onMouseEnter={
          theme
            ? (e) => {
                e.currentTarget.style.backgroundColor = hoverBg ?? ""
              }
            : undefined
        }
        onMouseLeave={
          theme
            ? (e) => {
                e.currentTarget.style.backgroundColor = nodeMatches
                  ? `${theme.fg}15`
                  : ""
              }
            : undefined
        }
      >
        <span className="w-4 shrink-0" />
        <span className="font-mono text-xs">
          {renderKey()}
          <TokenSpan token="punctuation">: </TokenSpan>
          {renderValue()}
          <TokenSpan token="punctuation">{comma}</TokenSpan>
        </span>
        <button
          type="button"
          onClick={handleCopyPath}
          aria-label={`${labels.copyPath}: ${path}`}
          className={copyIconClass}
          style={theme ? { color: theme.fg } : undefined}
        >
          {pathCopied ? (
            <CopyPlus className="size-3 text-emerald-500" />
          ) : (
            <CopyPlus className="size-3" />
          )}
        </button>
      </div>
    )
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [i, v] as [number, JsonValue])
    : (Object.entries(value as Record<string, JsonValue>) as [
        string,
        JsonValue,
      ][])

  const filteredEntries = searchQuery
    ? entries.filter(([k, v]) => hasSearchMatch(v, k, searchQuery))
    : entries
  const showAll = !searchQuery
  const displayEntries = showAll ? entries : filteredEntries

  return (
    <div>
      <div
        className={rowClass}
        style={rowStyle}
        onMouseEnter={
          theme
            ? (e) => {
                e.currentTarget.style.backgroundColor = hoverBg ?? ""
              }
            : undefined
        }
        onMouseLeave={
          theme
            ? (e) => {
                e.currentTarget.style.backgroundColor = nodeMatches
                  ? `${theme.fg}15`
                  : ""
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isExpanded ? labels.collapse : labels.expand}
          className="flex size-4 shrink-0 items-center justify-center transition-transform"
          style={theme ? { color: theme.punctuation } : undefined}
        >
          <ChevronRight
            className={cn(
              "size-3 transition-transform",
              isExpanded && "rotate-90",
              !theme && "text-muted-foreground"
            )}
          />
        </button>
        <span className="font-mono text-xs">
          {renderKey()}
          <TokenSpan token="punctuation">: </TokenSpan>
          <TokenSpan token="punctuation">{openBracket}</TokenSpan>
          {!isExpanded && (
            <>
              <span
                className={cn(
                  "mx-1 text-[10px] tabular-nums",
                  !theme && "text-muted-foreground/60"
                )}
                style={theme ? { color: `${theme.fg}60` } : undefined}
              >
                {count} {count === 1 ? labels.item : labels.items}
              </span>
              <TokenSpan token="punctuation">
                {closeBracket}
                {comma}
              </TokenSpan>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={handleCopyPath}
          aria-label={`${labels.copyPath}: ${path}`}
          className={copyIconClass}
          style={theme ? { color: theme.fg } : undefined}
        >
          {pathCopied ? (
            <CopyPlus className="size-3 text-emerald-500" />
          ) : (
            <CopyPlus className="size-3" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {displayEntries.map(([k, v], i) => {
            const childPath = buildPath(path, k)
            return (
              <JsonNode
                key={childPath}
                keyName={k}
                value={v}
                path={childPath}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
                searchQuery={searchQuery}
                collapsedPaths={collapsedPaths}
                onToggle={onToggle}
                isLast={i === displayEntries.length - 1}
              />
            )
          })}
          <div
            className={cn(
              "font-mono text-xs",
              !theme && "text-muted-foreground"
            )}
            style={{
              paddingLeft: `${depth * 20 + 8 + 16}px`,
              ...(theme ? { color: theme.punctuation } : {}),
            }}
          >
            {closeBracket}
            {comma}
          </div>
        </>
      )}
    </div>
  )
}

function collectPaths(
  value: JsonValue,
  path: string,
  maxDepth: number | true,
  depth: number,
  result: Set<string>
): void {
  if (value === null || typeof value !== "object") return
  if (maxDepth !== true && depth >= maxDepth) {
    result.add(path)
  }
  const entries = Array.isArray(value)
    ? value.map((v, i) => [i, v] as const)
    : Object.entries(value)
  for (const [k, v] of entries) {
    collectPaths(v, buildPath(path, k), maxDepth, depth + 1, result)
  }
}

function allExpandablePaths(value: JsonValue, rootName: string): Set<string> {
  const result = new Set<string>()
  collectAllExpandable(value, rootName, result)
  return result
}

function collectAllExpandable(
  value: JsonValue,
  path: string,
  result: Set<string>
): void {
  if (value === null || typeof value !== "object") return
  result.add(path)
  const entries = Array.isArray(value)
    ? value.map((v, i) => [i, v] as const)
    : Object.entries(value)
  for (const [k, v] of entries) {
    collectAllExpandable(v, buildPath(path, k), result)
  }
}

function resolveTheme(
  theme: ShikiThemeName | JsonColorTheme | undefined
): JsonColorTheme | null {
  if (!theme) return null
  if (typeof theme === "string") return jsonThemes[theme] ?? null
  return theme
}

interface JsonViewerProps extends Omit<
  React.ComponentProps<"div">,
  "children" | "title"
> {
  /** Any JSON-serializable value to display. */
  data: JsonValue
  /** Optional heading label. */
  title?: string
  /** Label for the root node. Defaults to "root". */
  rootName?: string
  /**
   * Depth to expand by default.
   * - Number: expand nodes up to this depth (default 1)
   * - `true`: expand all nodes
   */
  defaultExpanded?: number | true
  /**
   * Editor color theme. Pass a shiki theme name (e.g. "dracula", "github-dark")
   * or a custom JsonColorTheme object. When omitted, uses Tailwind theme colors.
   */
  colorTheme?: ShikiThemeName | JsonColorTheme
  /** Optional chrome labels. English defaults keep the viewer usable without i18n. */
  labels?: Partial<JsonViewerLabels>
}

function resolveViewerLabels(
  labels: Partial<JsonViewerLabels> | undefined
): JsonViewerLabels {
  return {
    search: labels?.search ?? DEFAULT_JSON_VIEWER_LABELS.search,
    expandAll: labels?.expandAll ?? DEFAULT_JSON_VIEWER_LABELS.expandAll,
    collapseAll: labels?.collapseAll ?? DEFAULT_JSON_VIEWER_LABELS.collapseAll,
    copy: labels?.copy ?? DEFAULT_JSON_VIEWER_LABELS.copy,
    item: labels?.item ?? DEFAULT_JSON_VIEWER_LABELS.item,
    items: labels?.items ?? DEFAULT_JSON_VIEWER_LABELS.items,
    key: labels?.key ?? DEFAULT_JSON_VIEWER_LABELS.key,
    keys: labels?.keys ?? DEFAULT_JSON_VIEWER_LABELS.keys,
    closeSearch: labels?.closeSearch ?? DEFAULT_JSON_VIEWER_LABELS.closeSearch,
    clearSearch: labels?.clearSearch ?? DEFAULT_JSON_VIEWER_LABELS.clearSearch,
    searchPlaceholder:
      labels?.searchPlaceholder ?? DEFAULT_JSON_VIEWER_LABELS.searchPlaceholder,
    searchInputLabel:
      labels?.searchInputLabel ?? DEFAULT_JSON_VIEWER_LABELS.searchInputLabel,
    copyPath: labels?.copyPath ?? DEFAULT_JSON_VIEWER_LABELS.copyPath,
    expand: labels?.expand ?? DEFAULT_JSON_VIEWER_LABELS.expand,
    collapse: labels?.collapse ?? DEFAULT_JSON_VIEWER_LABELS.collapse,
  }
}

function JsonViewer({
  data,
  title,
  rootName = "root",
  defaultExpanded = 1,
  colorTheme,
  labels,
  className,
  ...props
}: JsonViewerProps) {
  const resolved = resolveTheme(colorTheme)
  const resolvedLabels = resolveViewerLabels(labels)
  const searchInputId = React.useId()

  const [collapsedPaths, setCollapsedPaths] = React.useState<Set<string>>(
    () => {
      if (defaultExpanded === true) return new Set()
      const collapsed = new Set<string>()
      collectPaths(data, rootName, defaultExpanded, 0, collapsed)
      return collapsed
    }
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { active: copiedAll, trigger: flashCopiedAll } =
    useTimedFlag(COPY_FLASH_MS)
  const searchRef = React.useRef<HTMLInputElement>(null)

  const togglePath = React.useCallback((path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const expandAll = React.useCallback(() => {
    setCollapsedPaths(new Set())
  }, [])

  const collapseAll = React.useCallback(() => {
    const all = allExpandablePaths(data, rootName)
    setCollapsedPaths(all)
  }, [data, rootName])

  const copyJson = React.useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      flashCopiedAll()
    })
  }, [data, flashCopiedAll])

  const toggleSearch = React.useCallback(() => {
    const nextSearchOpen = !searchOpen
    setSearchOpen(nextSearchOpen)

    if (nextSearchOpen) {
      requestAnimationFrame(() => searchRef.current?.focus())
      return
    }

    setSearchQuery("")
  }, [searchOpen])

  const isExpandable = data !== null && typeof data === "object"
  const type = typeOf(data)
  const entryCount = isExpandable ? countEntries(data) : 0
  const entryLabel =
    type === "array"
      ? entryCount === 1
        ? resolvedLabels.item
        : resolvedLabels.items
      : entryCount === 1
        ? resolvedLabels.key
        : resolvedLabels.keys

  return (
    <ThemeContext value={resolved}>
      <LabelsContext value={resolvedLabels}>
        <div
          data-slot="json-viewer"
          className={cn(
            "overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
            className
          )}
          {...props}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 sm:px-4">
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {isExpandable && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                  {entryCount} {entryLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={toggleSearch}
                aria-label={
                  searchOpen
                    ? resolvedLabels.closeSearch
                    : resolvedLabels.search
                }
                className={cn(
                  chromeButtonClassName,
                  searchOpen && "bg-muted text-foreground"
                )}
              >
                <Search className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={expandAll}
                aria-label={resolvedLabels.expandAll}
                className={chromeButtonClassName}
              >
                <UnfoldHorizontal className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={collapseAll}
                aria-label={resolvedLabels.collapseAll}
                className={chromeButtonClassName}
              >
                <FoldHorizontal className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={copyJson}
                aria-label={resolvedLabels.copy}
                className={chromeButtonClassName}
              >
                {copiedAll ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-3 py-1.5 sm:px-4">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <label className="sr-only" htmlFor={searchInputId}>
                {resolvedLabels.searchInputLabel}
              </label>
              <input
                id={searchInputId}
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const nextQuery = e.target.value
                  setSearchQuery(nextQuery)
                  if (nextQuery) {
                    setCollapsedPaths(new Set())
                  }
                }}
                placeholder={resolvedLabels.searchPlaceholder}
                aria-label={resolvedLabels.searchInputLabel}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={resolvedLabels.clearSearch}
                  className={chromeButtonClassName}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Tree */}
          <div
            className="overflow-auto py-1"
            style={
              resolved
                ? {
                    backgroundColor: resolved.bg,
                    color: resolved.fg,
                  }
                : undefined
            }
          >
            {isExpandable ? (
              <JsonNode
                keyName={rootName}
                value={data}
                path={rootName}
                depth={0}
                defaultExpanded={defaultExpanded}
                searchQuery={searchQuery}
                collapsedPaths={collapsedPaths}
                onToggle={togglePath}
                isLast
              />
            ) : (
              <div className="px-4 py-2 font-mono text-xs">
                <TokenSpan token="key">{rootName}</TokenSpan>
                <TokenSpan token="punctuation">: </TokenSpan>
                {typeof data === "string" ? (
                  <TokenSpan token="string">&quot;{data}&quot;</TokenSpan>
                ) : typeof data === "number" ? (
                  <TokenSpan token="number">{String(data)}</TokenSpan>
                ) : typeof data === "boolean" ? (
                  <TokenSpan token="boolean">{String(data)}</TokenSpan>
                ) : (
                  <TokenSpan token="null" italic>
                    null
                  </TokenSpan>
                )}
              </div>
            )}
          </div>
        </div>
      </LabelsContext>
    </ThemeContext>
  )
}

export {
  JsonViewer,
  type JsonViewerProps,
  type JsonViewerLabels,
  type JsonValue,
}
