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

const TOKEN_FALLBACK_MAP: Record<keyof JsonColorTheme, string> = {
  key: "text-violet-600 dark:text-violet-400",
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  boolean: "text-amber-600 dark:text-amber-400",
  null: "text-muted-foreground/60",
  punctuation: "text-muted-foreground",
  fg: "",
  bg: "",
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

  return (
    <span
      className={cn(TOKEN_FALLBACK_MAP[token], italic && "italic", className)}
    >
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

function JsonNodeKey({
  keyName,
  searchQuery,
}: {
  keyName: string | number
  searchQuery: string
}) {
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

function JsonPrimitiveValue({
  value,
  searchQuery,
}: {
  value: JsonValue
  searchQuery: string
}) {
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

function jsonNodeCopyIconClass(theme: JsonColorTheme | null) {
  return cn(
    "ml-1 inline-flex items-center justify-center rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    theme
      ? "opacity-0 group-hover:opacity-60 hover:!opacity-100"
      : "text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground focus-visible:text-muted-foreground"
  )
}

function JsonNodeRow({
  depth,
  theme,
  nodeMatches,
  toggle,
  children,
  copyButton,
}: {
  depth: number
  theme: JsonColorTheme | null
  nodeMatches: boolean
  toggle?: React.ReactNode
  children: React.ReactNode
  copyButton: React.ReactNode
}) {
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
      {toggle ?? <span className="w-4 shrink-0" />}
      <span className="font-mono text-xs">{children}</span>
      {copyButton}
    </div>
  )
}

function JsonCopyPathButton({
  path,
  copied,
  onCopy,
  copyIconClass,
  theme,
  copyPathLabel,
}: {
  path: string
  copied: boolean
  onCopy: () => void
  copyIconClass: string
  theme: JsonColorTheme | null
  copyPathLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${copyPathLabel}: ${path}`}
      className={copyIconClass}
      style={theme ? { color: theme.fg } : undefined}
    >
      <CopyPlus className={cn("size-3", copied && "text-emerald-500")} />
    </button>
  )
}

function JsonLeafNode({
  keyName,
  value,
  path,
  depth,
  searchQuery,
  isLast,
}: JsonNodeProps) {
  const theme = useThemeColors()
  const labels = useViewerLabels()
  const { active: pathCopied, trigger: flashPathCopied } =
    useTimedFlag(COPY_FLASH_MS)
  const nodeMatches = Boolean(
    searchQuery && matchesSearch(keyName, value, searchQuery)
  )
  const comma = isLast ? "" : ","

  const handleCopyPath = React.useCallback(() => {
    navigator.clipboard.writeText(path).then(() => {
      flashPathCopied()
    })
  }, [flashPathCopied, path])

  return (
    <JsonNodeRow
      depth={depth}
      theme={theme}
      nodeMatches={nodeMatches}
      copyButton={
        <JsonCopyPathButton
          path={path}
          copied={pathCopied}
          onCopy={handleCopyPath}
          copyIconClass={jsonNodeCopyIconClass(theme)}
          theme={theme}
          copyPathLabel={labels.copyPath}
        />
      }
    >
      <JsonNodeKey keyName={keyName} searchQuery={searchQuery} />
      <TokenSpan token="punctuation">: </TokenSpan>
      <JsonPrimitiveValue value={value} searchQuery={searchQuery} />
      <TokenSpan token="punctuation">{comma}</TokenSpan>
    </JsonNodeRow>
  )
}

function getDisplayEntries(value: JsonValue, searchQuery: string) {
  const entries = Array.isArray(value)
    ? value.map((v, i) => [i, v] as [number, JsonValue])
    : (Object.entries(value as Record<string, JsonValue>) as [
        string,
        JsonValue,
      ][])

  return searchQuery
    ? entries.filter(([k, v]) => hasSearchMatch(v, k, searchQuery))
    : entries
}

function JsonBranchExpandedChildren({
  displayEntries,
  path,
  depth,
  defaultExpanded,
  searchQuery,
  collapsedPaths,
  onToggle,
  closeBracket,
  comma,
  theme,
}: {
  displayEntries: [string | number, JsonValue][]
  path: string
  depth: number
  defaultExpanded: number | true
  searchQuery: string
  collapsedPaths: Set<string>
  onToggle: (path: string) => void
  closeBracket: string
  comma: string
  theme: JsonColorTheme | null
}) {
  return (
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
        className={cn("font-mono text-xs", !theme && "text-muted-foreground")}
        style={{
          paddingLeft: `${depth * 20 + 8 + 16}px`,
          ...(theme ? { color: theme.punctuation } : {}),
        }}
      >
        {closeBracket}
        {comma}
      </div>
    </>
  )
}

function JsonBranchNode({
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
  const labels = useViewerLabels()
  const { active: pathCopied, trigger: flashPathCopied } =
    useTimedFlag(COPY_FLASH_MS)
  const type = typeOf(value)
  const count = countEntries(value)
  const isExpanded = !collapsedPaths.has(path)
  const openBracket = type === "array" ? "[" : "{"
  const closeBracket = type === "array" ? "]" : "}"
  const comma = isLast ? "" : ","
  const nodeMatches = Boolean(
    searchQuery && matchesSearch(keyName, value, searchQuery)
  )

  const handleToggle = React.useCallback(() => {
    onToggle(path)
  }, [onToggle, path])

  const handleCopyPath = React.useCallback(() => {
    navigator.clipboard.writeText(path).then(() => {
      flashPathCopied()
    })
  }, [flashPathCopied, path])

  const entries = getDisplayEntries(value, searchQuery)

  const copyButton = (
    <JsonCopyPathButton
      path={path}
      copied={pathCopied}
      onCopy={handleCopyPath}
      copyIconClass={jsonNodeCopyIconClass(theme)}
      theme={theme}
      copyPathLabel={labels.copyPath}
    />
  )

  const toggle = (
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
  )

  return (
    <div>
      <JsonNodeRow
        depth={depth}
        theme={theme}
        nodeMatches={nodeMatches}
        toggle={toggle}
        copyButton={copyButton}
      >
        <JsonNodeKey keyName={keyName} searchQuery={searchQuery} />
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
      </JsonNodeRow>

      {isExpanded ? (
        <JsonBranchExpandedChildren
          displayEntries={entries}
          path={path}
          depth={depth}
          defaultExpanded={defaultExpanded}
          searchQuery={searchQuery}
          collapsedPaths={collapsedPaths}
          onToggle={onToggle}
          closeBracket={closeBracket}
          comma={comma}
          theme={theme}
        />
      ) : null}
    </div>
  )
}

function JsonNode(props: JsonNodeProps) {
  const type = typeOf(props.value)
  if (type !== "object" && type !== "array") {
    return <JsonLeafNode {...props} />
  }
  return <JsonBranchNode {...props} />
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

function resolveEntryCountLabel(
  type: string,
  entryCount: number,
  labels: JsonViewerLabels
) {
  if (type === "array") {
    return entryCount === 1 ? labels.item : labels.items
  }
  return entryCount === 1 ? labels.key : labels.keys
}

function useJsonViewerState(
  data: JsonValue,
  rootName: string,
  defaultExpanded: number | true
) {
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
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const expandAll = React.useCallback(() => {
    setCollapsedPaths(new Set())
  }, [])

  const collapseAll = React.useCallback(() => {
    setCollapsedPaths(allExpandablePaths(data, rootName))
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

  return {
    collapsedPaths,
    searchQuery,
    setSearchQuery,
    searchOpen,
    copiedAll,
    searchRef,
    togglePath,
    expandAll,
    collapseAll,
    copyJson,
    toggleSearch,
  }
}

function JsonViewerToolbar({
  title,
  isExpandable,
  entryCount,
  entryLabel,
  labels,
  searchOpen,
  copiedAll,
  onToggleSearch,
  onExpandAll,
  onCollapseAll,
  onCopy,
}: {
  title?: string
  isExpandable: boolean
  entryCount: number
  entryLabel: string
  labels: JsonViewerLabels
  searchOpen: boolean
  copiedAll: boolean
  onToggleSearch: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onCopy: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 sm:px-4">
      <div className="flex items-center gap-2">
        {title ? (
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        ) : null}
        {isExpandable ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
            {entryCount} {entryLabel}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label={searchOpen ? labels.closeSearch : labels.search}
          className={cn(
            chromeButtonClassName,
            searchOpen && "bg-muted text-foreground"
          )}
        >
          <Search className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onExpandAll}
          aria-label={labels.expandAll}
          className={chromeButtonClassName}
        >
          <UnfoldHorizontal className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          aria-label={labels.collapseAll}
          className={chromeButtonClassName}
        >
          <FoldHorizontal className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onCopy}
          aria-label={labels.copy}
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
  )
}

function JsonViewerSearchPanel({
  open,
  searchInputId,
  searchRef,
  searchQuery,
  labels,
  onQueryChange,
  onClear,
}: {
  open: boolean
  searchInputId: string
  searchRef: React.RefObject<HTMLInputElement | null>
  searchQuery: string
  labels: JsonViewerLabels
  onQueryChange: (query: string) => void
  onClear: () => void
}) {
  if (!open) return null

  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-3 py-1.5 sm:px-4">
      <Search className="size-3.5 shrink-0 text-muted-foreground" />
      <label className="sr-only" htmlFor={searchInputId}>
        {labels.searchInputLabel}
      </label>
      <input
        id={searchInputId}
        ref={searchRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchInputLabel}
        className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={labels.clearSearch}
          className={chromeButtonClassName}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}

function JsonViewerScalarRoot({
  rootName,
  data,
}: {
  rootName: string
  data: JsonValue
}) {
  return (
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
  )
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

  const {
    collapsedPaths,
    searchQuery,
    setSearchQuery,
    searchOpen,
    copiedAll,
    searchRef,
    togglePath,
    expandAll,
    collapseAll,
    copyJson,
    toggleSearch,
  } = useJsonViewerState(data, rootName, defaultExpanded)

  const isExpandable = data !== null && typeof data === "object"
  const type = typeOf(data)
  const entryCount = isExpandable ? countEntries(data) : 0
  const entryLabel = resolveEntryCountLabel(type, entryCount, resolvedLabels)

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
          <JsonViewerToolbar
            title={title}
            isExpandable={isExpandable}
            entryCount={entryCount}
            entryLabel={entryLabel}
            labels={resolvedLabels}
            searchOpen={searchOpen}
            copiedAll={copiedAll}
            onToggleSearch={toggleSearch}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onCopy={copyJson}
          />

          <JsonViewerSearchPanel
            open={searchOpen}
            searchInputId={searchInputId}
            searchRef={searchRef}
            searchQuery={searchQuery}
            labels={resolvedLabels}
            onQueryChange={(nextQuery) => {
              setSearchQuery(nextQuery)
              if (nextQuery) {
                // Search should reveal matches immediately.
                expandAll()
              }
            }}
            onClear={() => setSearchQuery("")}
          />

          {/* Tree */}
          <div
            className="overflow-auto py-3"
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
              <JsonViewerScalarRoot rootName={rootName} data={data} />
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
