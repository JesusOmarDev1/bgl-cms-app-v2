"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
} from "motion/react"
import type { Transition, Variants } from "motion/react"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motionTokens } from "@/lib/animation/motion/motion-tokens"
import { cn } from "cn"

/** One group of cookies a visitor can allow or refuse. */
export interface CookieCategory {
  id: string
  label: string
  description?: string
  /** Needed for the site to work. Always on and cannot be switched off. */
  required?: boolean
  /** Starting position of the switch before a choice is saved. Non-essential categories default to off. */
  defaultEnabled?: boolean
}

/** Category id to allowed. */
export type CookieConsentValue = Record<string, boolean>
export type CookieConsentAction = "accept-all" | "reject-all" | "save" | "reset"

/** What is written to storage under `storageKey`. */
export interface StoredCookieConsent {
  value: CookieConsentValue
  version: string
  updatedAt: string
}

export interface CookieConsentHandle {
  /** Opens the preferences panel, for example from a "Cookie settings" footer link. */
  openPreferences: () => void
  /** Closes the preferences panel without saving. */
  closePreferences: () => void
  /** Forgets the saved choice and asks again. */
  reset: () => void
}

export interface CookieConsentLabels {
  message: ReactNode
  customize: string
  acceptAll: string
  rejectAll: string
  save: string
  preferencesTitle: string
  preferencesDescription: ReactNode
  reopen: string
  alwaysOn: string
  close: string
}

/**
 * A consent bar that morphs into a preferences panel and, once a choice is saved, folds into a small floating button that
 * reopens it. One surface springs between all three shapes. Non-essential categories start off, refusing is as easy as
 * accepting, and the choice is reported through `onChange` and can be remembered in `localStorage`.
 */
export interface CookieConsentProps {
  categories?: CookieCategory[]
  /** The saved choice. `null` means the visitor has not decided yet. Leave it out to let the component manage it. */
  value?: CookieConsentValue | null
  defaultValue?: CookieConsentValue | null
  onChange?: (
    value: CookieConsentValue | null,
    detail: { action: CookieConsentAction; updatedAt: Date }
  ) => void
  /** Remembers the choice in `localStorage` under this key. Read it elsewhere with `readCookieConsent`. */
  storageKey?: string
  /** Bump when your categories or policy change to ask again. */
  version?: string
  /** Whether the preferences panel is open. */
  preferencesOpen?: boolean
  defaultPreferencesOpen?: boolean
  onPreferencesOpenChange?: (open: boolean) => void
  /** Link to the full policy, shown in the bar and panel. */
  policy?: { label: string; href?: string; onClick?: () => void }
  position?: "bottom" | "bottom-left" | "bottom-right"
  /** `fixed` pins to the viewport; `absolute` fills the nearest positioned ancestor, useful for previews. */
  strategy?: "fixed" | "absolute"
  /** Keep a small button after a choice so visitors can change their mind. Defaults to true. */
  showReopenButton?: boolean
  /** Corner for the reopen button. Defaults to the bar's side, or left when the bar is centered. */
  reopenSide?: "left" | "right"
  labels?: Partial<CookieConsentLabels>
  className?: string
}

export const defaultCookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    label: "Strictly necessary",
    description:
      "Sign-in, security, and your cart. The site can't work without these.",
    required: true,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Remember your language, region, and display settings.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Count visits and see which pages help, only in aggregate.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Measure campaigns and show relevant ads on other sites.",
  },
]

const defaultLabels: CookieConsentLabels = {
  message:
    "We use essential cookies to run this site. With your OK, we'd also use optional ones to remember settings and learn what helps.",
  customize: "Customize",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  save: "Save choices",
  preferencesTitle: "Cookie preferences",
  preferencesDescription:
    "Choose which optional cookies we can use. You can change this any time.",
  reopen: "Cookie preferences",
  alwaysOn: "Always on",
  close: "Close preferences",
}

/** Reads a saved choice, or `null` when there is none or it was saved for another version. Safe to call on the server. */
export function readCookieConsent(
  storageKey: string,
  version = "1"
): StoredCookieConsent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredCookieConsent>
    if (
      !parsed ||
      typeof parsed.value !== "object" ||
      parsed.value === null ||
      parsed.version !== version
    )
      return null
    return {
      value: parsed.value,
      version: parsed.version,
      updatedAt: String(parsed.updatedAt ?? ""),
    }
  } catch {
    return null
  }
}

function writeCookieConsent(
  storageKey: string,
  stored: StoredCookieConsent | null
) {
  try {
    if (stored) window.localStorage.setItem(storageKey, JSON.stringify(stored))
    else window.localStorage.removeItem(storageKey)
  } catch {
    /* Storage can be blocked; the callback still reports the choice. */
  }
}

type Mode = "bar" | "panel" | "chip"
type Bezier = [number, number, number, number]
const enter = [...motionTokens.ease.enter] as Bezier
const standard = [...motionTokens.ease.standard] as Bezier
/** Duration springs restated as stiffness and damping, so a retarget mid-flight keeps its velocity. */
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return {
    type: "spring",
    stiffness: root * root,
    damping: 2 * (1 - bounce) * root,
    mass: 1,
  }
}
const GROW = physical(0.46, 0.14),
  SHRINK = physical(0.38, 0)
const BAR_MAX = 660,
  PANEL_MAX = 420,
  CHIP = 44,
  STACK_BELOW = 560

const subscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

const faceVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: `blur(${motionTokens.blur.soft}px)` },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      y: physical(0.42, 0.08),
      opacity: { duration: 0.22, ease: enter, delay: 0.04 },
      filter: { duration: 0.26, ease: enter, delay: 0.04 },
    },
  },
  gone: {
    opacity: 0,
    y: 4,
    filter: `blur(${motionTokens.blur.soft}px)`,
    transition: { duration: 0.12, ease: standard },
  },
}
const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.16 } },
  gone: { opacity: 0, transition: { duration: 0.1 } },
}

/** A face reports its natural height while it is current, then goes inert as it leaves. It is pinned to the side the surface is placed on, so a
 *  centered bar and panel cross-fade in place instead of the incoming face sliding in from the surface's left edge. */
function Face({
  id,
  width,
  side,
  reduced,
  focusOnMount,
  onSize,
  className,
  children,
  ...rest
}: {
  id: Mode
  width: number
  side: "left" | "right" | "center"
  reduced: boolean
  focusOnMount: boolean
  onSize: (id: Mode, height: number) => void
  className?: string
  children: ReactNode
  role?: string
  "aria-modal"?: boolean
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-label"?: string
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const present = useIsPresent()
  useLayoutEffect(() => {
    const node = ref.current
    if (!node || !present) return
    const report = () => onSize(id, node.offsetHeight)
    report()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(report)
    observer.observe(node)
    return () => observer.disconnect()
  }, [id, onSize, present])
  useEffect(() => {
    if (!focusOnMount) return
    ref.current
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus({ preventScroll: true })
  }, [focusOnMount])
  return (
    <motion.div
      {...rest}
      ref={ref}
      className={cn(
        "absolute bottom-0 left-0 box-border inert:pointer-events-none data-[side=center]:left-1/2 data-[side=center]:[translate:-50%_0] data-[side=right]:right-0 data-[side=right]:left-auto",
        className
      )}
      style={{ width }}
      data-face={id}
      data-side={side}
      variants={reduced ? fadeVariants : faceVariants}
      initial="hidden"
      animate="shown"
      exit="gone"
      inert={!present || undefined}
    >
      {children}
    </motion.div>
  )
}

export const CookieConsent = forwardRef<
  CookieConsentHandle,
  CookieConsentProps
>(function CookieConsent(
  {
    categories = defaultCookieCategories,
    value,
    defaultValue = null,
    onChange,
    storageKey,
    version = "1",
    preferencesOpen,
    defaultPreferencesOpen = false,
    onPreferencesOpenChange,
    policy,
    position = "bottom",
    strategy = "fixed",
    showReopenButton = true,
    reopenSide,
    labels: labelOverrides,
    className,
  },
  ref
) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const reduced = !!useReducedMotion()
  const hydrated = useHydrated()
  const uid = useId()
  const titleId = `${uid}-title`,
    descriptionId = `${uid}-description`,
    messageId = `${uid}-message`

  /* The saved choice: controlled, or internal and seeded from storage once on the client. */
  const [internal, setInternal] = useState<CookieConsentValue | null>(
    defaultValue
  )
  const [loaded, setLoaded] = useState(!storageKey || value !== undefined)
  useEffect(() => {
    if (loaded || !storageKey) return
    const stored = readCookieConsent(storageKey, version)
    // Storage is only readable after hydration; this runs once to seed the saved choice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setInternal(stored.value)
    setLoaded(true)
  }, [loaded, storageKey, version])
  const consent = value !== undefined ? value : internal
  const decided = consent != null

  const [panelInternal, setPanelInternal] = useState(defaultPreferencesOpen)
  const panelOpen = preferencesOpen ?? panelInternal
  const setPanel = useCallback(
    (next: boolean) => {
      if (preferencesOpen === undefined) setPanelInternal(next)
      onPreferencesOpenChange?.(next)
    },
    [onPreferencesOpenChange, preferencesOpen]
  )

  const baseline = useCallback(
    (from: CookieConsentValue | null) =>
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          category.required
            ? true
            : (from?.[category.id] ?? category.defaultEnabled ?? false),
        ])
      ),
    [categories]
  )
  const [draft, setDraft] = useState<CookieConsentValue>(() =>
    baseline(consent)
  )
  const [focusTarget, setFocusTarget] = useState<Mode | null>(null)

  const mode: Mode | null =
    !hydrated || !loaded
      ? null
      : panelOpen
        ? "panel"
        : !decided
          ? "bar"
          : showReopenButton
            ? "chip"
            : null

  const openPanel = useCallback(
    (focus = true) => {
      setDraft(baseline(consent))
      setFocusTarget(focus ? "panel" : null)
      setPanel(true)
    },
    [baseline, consent, setPanel]
  )

  const closePanel = useCallback(
    (focus = true) => {
      setFocusTarget(focus ? (decided ? "chip" : "bar") : null)
      setPanel(false)
    },
    [decided, setPanel]
  )

  const commit = useCallback(
    (next: CookieConsentValue | null, action: CookieConsentAction) => {
      const updatedAt = new Date()
      if (value === undefined) setInternal(next)
      if (storageKey)
        writeCookieConsent(
          storageKey,
          next
            ? { value: next, version, updatedAt: updatedAt.toISOString() }
            : null
        )
      onChange?.(next, { action, updatedAt })
    },
    [onChange, storageKey, value, version]
  )

  const choose = (action: "accept-all" | "reject-all" | "save") => {
    const next =
      action === "save"
        ? { ...draft }
        : Object.fromEntries(
            categories.map((category) => [
              category.id,
              category.required ? true : action === "accept-all",
            ])
          )
    // Keep focus on the page: the choice folds the surface into its reopen button, which takes focus when it exists.
    setFocusTarget(showReopenButton ? "chip" : null)
    commit(next, action)
    if (panelOpen) setPanel(false)
  }

  useImperativeHandle(
    ref,
    () => ({
      openPreferences: () => openPanel(true),
      closePreferences: () => closePanel(false),
      reset: () => {
        setPanel(false)
        setFocusTarget(null)
        commit(null, "reset")
      },
    }),
    [closePanel, commit, openPanel, setPanel]
  )

  /* Geometry. The layer is measured; each face gets an explicit width, reports its height, and the surface springs to it. */
  const layerRef = useRef<HTMLDivElement>(null)
  const [layerWidth, setLayerWidth] = useState(0)
  useLayoutEffect(() => {
    const node = layerRef.current
    if (!node) return
    const read = () => setLayerWidth(node.clientWidth)
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const align =
    position === "bottom-left"
      ? "left"
      : position === "bottom-right"
        ? "right"
        : "center"
  const chipSide = reopenSide ?? (align === "right" ? "right" : "left")
  const widths = {
    bar: Math.min(layerWidth, BAR_MAX),
    panel: Math.min(layerWidth, PANEL_MAX),
    chip: CHIP,
  }
  const place = (width: number, side: "left" | "right" | "center") =>
    side === "left"
      ? 0
      : side === "right"
        ? layerWidth - width
        : (layerWidth - width) / 2
  // Reopened preferences grow out of the corner button, so the panel opens on its side once a choice exists.
  const panelSide = decided && showReopenButton ? chipSide : align

  const x = useMotionValue(0),
    width = useMotionValue(0),
    height = useMotionValue(0),
    radius = useMotionValue(22)
  const heights = useRef<Record<Mode, number>>({ bar: 0, panel: 0, chip: CHIP })
  const shape = useRef({ w: 0, h: 0, ready: false })
  const [tick, setTick] = useState(0)
  const onSize = useCallback((id: Mode, h: number) => {
    if (heights.current[id] === h) return
    heights.current[id] = h
    setTick((count) => count + 1)
  }, [])

  useLayoutEffect(() => {
    if (!mode || !layerWidth) {
      shape.current.ready = false
      return
    }
    const w = widths[mode],
      h = mode === "chip" ? CHIP : heights.current[mode]
    if (!h) return
    const next = {
      x: place(
        w,
        mode === "chip" ? chipSide : mode === "panel" ? panelSide : align
      ),
      w,
      h,
      r: mode === "chip" ? CHIP / 2 : mode === "panel" ? 26 : 22,
    }
    if (!shape.current.ready || reduced) {
      x.jump(next.x)
      width.jump(next.w)
      height.jump(next.h)
      radius.jump(next.r)
      shape.current = { w: next.w, h: next.h, ready: true }
      return
    }
    const transition =
      next.w * next.h >= shape.current.w * shape.current.h ? GROW : SHRINK
    shape.current = { w: next.w, h: next.h, ready: true }
    animate(x, next.x, transition)
    animate(width, next.w, transition)
    animate(height, next.h, transition)
    animate(radius, next.r, transition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, layerWidth, tick, reduced, align, chipSide, panelSide])

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return
    event.stopPropagation()
    closePanel(true)
  }

  const policyClass =
    "cursor-pointer border-0 bg-transparent p-0 [font:inherit] text-[var(--foreground)] underline decoration-[color:var(--border-strong)] underline-offset-[3px] transition-[text-decoration-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:decoration-current motion-reduce:transition-none"
  const policyLink = policy ? (
    policy.href ? (
      <a className={policyClass} href={policy.href} onClick={policy.onClick}>
        {policy.label}
      </a>
    ) : (
      <button type="button" className={policyClass} onClick={policy.onClick}>
        {policy.label}
      </button>
    )
  ) : null
  const optional = categories.filter((category) => !category.required)
  const allowedCount = optional.filter((category) => draft[category.id]).length

  return (
    <div
      ref={layerRef}
      className={cn(
        strategy === "absolute" ? "absolute z-[5]" : "fixed z-[60]",
        "pointer-events-none right-[16px] bottom-[16px] left-[16px] h-0 font-[family-name:var(--font-body)] tracking-[var(--tracking-body)]",
        className
      )}
      data-position={position}
    >
      <AnimatePresence>
        {mode ? (
          <motion.div
            key="surface"
            className="pointer-events-auto absolute bottom-0 left-0 origin-bottom overflow-hidden bg-[var(--surface-raised)] text-[var(--foreground)] shadow-[0_0_0_1px_var(--border),var(--shadow-floating)] will-change-[transform,width,height]"
            style={{ x, width, height, borderRadius: radius }}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: reduced
                ? { duration: 0.16 }
                : {
                    y: physical(0.5, 0.1),
                    scale: physical(0.5, 0.1),
                    opacity: { duration: 0.24, ease: enter },
                  },
            }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.12 } }
                : {
                    opacity: 0,
                    y: 12,
                    scale: 0.96,
                    transition: { duration: 0.18, ease: standard },
                  }
            }
          >
            <AnimatePresence initial={false}>
              {mode === "bar" ? (
                <Face
                  key="bar"
                  id="bar"
                  width={widths.bar}
                  side={align}
                  reduced={reduced}
                  onSize={onSize}
                  focusOnMount={focusTarget === "bar"}
                  className="@container py-[10px] pr-[10px] pl-[18px]"
                  role="dialog"
                  aria-modal={false}
                  aria-label={labels.preferencesTitle}
                  aria-describedby={messageId}
                >
                  <div
                    className="group/bar flex items-center gap-[var(--space-4)] data-[stack]:flex-col data-[stack]:items-stretch data-[stack]:gap-[var(--space-3)] data-[stack]:pt-[6px] data-[stack]:pr-[8px]"
                    data-stack={widths.bar < STACK_BELOW || undefined}
                  >
                    <p
                      id={messageId}
                      className="m-0 min-w-0 flex-auto text-[length:var(--text-sm)] leading-[var(--leading-body)] text-pretty text-[var(--text-secondary)]"
                    >
                      {labels.message}
                      {policyLink ? <> {policyLink}</> : null}
                    </p>
                    <div className="flex flex-none items-center gap-[6px] group-data-[stack]/bar:grid group-data-[stack]/bar:grid-cols-[auto_1fr_1fr] @max-[300px]:group-data-[stack]/bar:grid-cols-[repeat(2,minmax(0,1fr))] @max-[300px]:group-data-[stack]/bar:[&>:first-child]:order-1 @max-[300px]:group-data-[stack]/bar:[&>:first-child]:col-span-full">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-autofocus
                        onClick={() => openPanel(true)}
                      >
                        {labels.customize}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => choose("reject-all")}
                      >
                        {labels.rejectAll}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => choose("accept-all")}
                      >
                        {labels.acceptAll}
                      </Button>
                    </div>
                  </div>
                </Face>
              ) : null}

              {mode === "panel" ? (
                <Face
                  key="panel"
                  id="panel"
                  width={widths.panel}
                  side={panelSide}
                  reduced={reduced}
                  onSize={onSize}
                  focusOnMount={focusTarget === "panel"}
                  className="@container grid gap-[var(--space-3)] p-[18px]"
                  role="dialog"
                  aria-modal={false}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  onKeyDown={onPanelKeyDown}
                >
                  <div className="-mt-[4px] -mb-[6px] flex items-center justify-between gap-[var(--space-3)]">
                    <h2
                      id={titleId}
                      className="m-0 text-[length:var(--text-base)] leading-[var(--leading-body)] font-medium"
                      tabIndex={-1}
                      data-autofocus
                    >
                      {labels.preferencesTitle}
                    </h2>
                    <button
                      type="button"
                      className="-mr-[8px] inline-grid size-[32px] flex-none cursor-pointer place-items-center rounded-[50%] border-0 bg-transparent p-0 text-[var(--text-secondary)] transition-[color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] [-webkit-tap-highlight-color:transparent] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] active:bg-[var(--surface-muted)] active:text-[var(--foreground)] motion-reduce:transition-none"
                      aria-label={labels.close}
                      onClick={() => closePanel(true)}
                    >
                      <X size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                  <p
                    id={descriptionId}
                    className="m-0 text-[length:var(--text-sm)] leading-[var(--leading-body)] text-pretty text-[var(--text-secondary)]"
                  >
                    {labels.preferencesDescription}
                    {policyLink ? <> {policyLink}</> : null}
                  </p>
                  <ul className="mx-[-6px] my-0 grid max-h-[var(--cookie-consent-list-max,min(46vh,300px))] [scrollbar-width:thin] list-none overflow-y-auto overscroll-contain p-0">
                    {categories.map((category) => {
                      const switchId = `${uid}-${category.id}`,
                        hintId = `${switchId}-hint`
                      return (
                        <li
                          key={category.id}
                          className="flex items-center justify-between gap-[var(--space-4)] border-t border-solid border-[color:var(--border-subtle)] px-[6px] py-[10px] first:border-t-0"
                        >
                          <div className="grid min-w-0 gap-[2px]">
                            <label
                              htmlFor={category.required ? undefined : switchId}
                              className="text-[length:var(--text-sm)] leading-[var(--leading-body)] font-medium text-[var(--foreground)] [&[for]]:cursor-pointer"
                            >
                              {category.label}
                            </label>
                            {category.description ? (
                              <p
                                id={hintId}
                                className="m-0 text-[length:var(--text-xs)] leading-[var(--leading-body)] text-[var(--text-muted)]"
                              >
                                {category.description}
                              </p>
                            ) : null}
                          </div>
                          {category.required ? (
                            <span className="flex-none text-[length:var(--text-xs)] whitespace-nowrap text-[var(--text-muted)]">
                              {labels.alwaysOn}
                            </span>
                          ) : (
                            <Switch
                              id={switchId}
                              aria-describedby={
                                category.description ? hintId : undefined
                              }
                              isSelected={!!draft[category.id]}
                              onChange={(checked) =>
                                setDraft((current) => ({
                                  ...current,
                                  [category.id]: checked,
                                }))
                              }
                            />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  <div className="grid grid-cols-[1fr_1fr] gap-[6px] border-t border-solid border-[color:var(--border-subtle)] pt-[var(--space-2)] @min-[340px]:grid-cols-[auto_auto_1fr]">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => choose("reject-all")}
                    >
                      {labels.rejectAll}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => choose("accept-all")}
                    >
                      {labels.acceptAll}
                    </Button>
                    <Button
                      size="sm"
                      className="col-span-full @min-[340px]:col-auto"
                      onClick={() => choose("save")}
                      aria-describedby={`${uid}-count`}
                    >
                      {labels.save}
                    </Button>
                    <span
                      id={`${uid}-count`}
                      className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
                    >{`${allowedCount} of ${optional.length} optional categories allowed`}</span>
                  </div>
                </Face>
              ) : null}

              {mode === "chip" ? (
                <Face
                  key="chip"
                  id="chip"
                  width={CHIP}
                  side={chipSide}
                  reduced={reduced}
                  onSize={onSize}
                  focusOnMount={focusTarget === "chip"}
                  className="h-[44px]"
                >
                  <button
                    type="button"
                    className="grid size-[44px] cursor-pointer place-items-center rounded-[50%] border-0 bg-transparent p-0 text-[var(--foreground)] transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] [-webkit-tap-highlight-color:transparent] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] motion-reduce:transition-none"
                    aria-label={labels.reopen}
                    aria-haspopup="dialog"
                    data-autofocus
                    onClick={() => openPanel(true)}
                  >
                    <Cookie size={20} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </Face>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

export default CookieConsent
