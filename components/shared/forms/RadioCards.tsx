"use client"

import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react"
import {
  LazyMotion,
  animate,
  domAnimation,
  useMotionValue,
  useReducedMotion,
} from "motion/react"
import * as m from "motion/react-m"
import type { Transition } from "motion/react"
import { cn } from "cn"
import { motionTokens } from "@/lib/animation/motion/motion-tokens"

export interface RadioCardOption {
  value: string
  label: ReactNode
  /** One or two short lines under the label. */
  description?: ReactNode
  /** A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. */
  meta?: ReactNode
  /** Plain decorative icon beside the label. */
  icon?: ReactNode
  disabled?: boolean
  /** Short reason shown in place of the description when the option is disabled. */
  disabledReason?: ReactNode
}

/**
 * Selectable option cards for choices that need more than a label: plans, shipping speeds, regions. One selection ring
 * glides from card to card on a spring, so the eye follows the change. Behaves as a native radio group: one tab stop,
 * arrow keys move and select, and a hidden input carries the value in forms.
 */
export interface RadioCardsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  options: RadioCardOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** "grid" places cards in responsive columns; "list" stacks full width rows. */
  layout?: "grid" | "list"
  /** Narrowest a grid column may get before the grid drops a column, in px. */
  minColumnWidth?: number
  /** Form field name. Renders a hidden input with the selected value. */
  name?: string
  required?: boolean
  disabled?: boolean
}

type Bezier = [number, number, number, number]
const standard = [...motionTokens.ease.standard] as Bezier
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return {
    type: "spring",
    stiffness: root * root,
    damping: 2 * (1 - bounce) * root,
    mass: 1,
  }
}
const GLIDE = physical(0.42, 0.14)

const subscribe = () => () => {}
function useReducedFlag() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  return !!useReducedMotion() && hydrated
}

export const RadioCards = forwardRef<HTMLDivElement, RadioCardsProps>(
  function RadioCards(
    {
      options,
      value,
      defaultValue = null,
      onValueChange,
      layout = "grid",
      minColumnWidth = 180,
      name,
      required,
      disabled = false,
      className,
      style,
      ...rest
    },
    forwardedRef
  ) {
    const reduced = useReducedFlag()
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const rootRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement)
    const [internal, setInternal] = useState<string | null>(defaultValue)
    const selected = value !== undefined ? value : internal
    const selectedIndex = options.findIndex(
      (option) => option.value === selected
    )
    const usable = (option: RadioCardOption) => !disabled && !option.disabled
    const tabStop =
      selectedIndex >= 0 && usable(options[selectedIndex]!)
        ? selectedIndex
        : options.findIndex(usable)

    const select = (next: string) => {
      if (next === selected) return
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    }

    /* The ring: one element that springs to the selected card's box. At rest it follows layout changes exactly. */
    const x = useMotionValue(0),
      y = useMotionValue(0),
      w = useMotionValue(0),
      h = useMotionValue(0),
      o = useMotionValue(0)
    const placed = useRef(false)
    const place = useCallback(
      (spring: boolean) => {
        const node =
          selectedIndex < 0
            ? null
            : rootRef.current?.querySelector<HTMLElement>(
                `[data-card="${selectedIndex}"]`
              )
        if (!node) {
          o.set(0)
          placed.current = false
          return
        }
        const box: [number, number, number, number] = [
          node.offsetLeft,
          node.offsetTop,
          node.offsetWidth,
          node.offsetHeight,
        ]
        if (!spring || !placed.current || reduced) {
          x.jump(box[0])
          y.jump(box[1])
          w.jump(box[2])
          h.jump(box[3])
          if (!placed.current && !reduced && spring) {
            o.jump(0)
            animate(o, 1, {
              duration: motionTokens.duration.fast,
              ease: standard,
            })
          } else o.jump(1)
          placed.current = true
          return
        }
        animate(x, box[0], GLIDE)
        animate(y, box[1], GLIDE)
        animate(w, box[2], GLIDE)
        animate(h, box[3], GLIDE)
        o.set(1)
      },
      [h, o, reduced, selectedIndex, w, x, y]
    )

    const placeRef = useRef(place)
    useLayoutEffect(() => {
      placeRef.current = place
      place(true)
    }, [place])
    // A resize only snaps the ring to the new layout; it never replays the glide.
    useLayoutEffect(() => {
      const root = rootRef.current
      if (!root || typeof ResizeObserver === "undefined") return
      const observer = new ResizeObserver(() => placeRef.current(false))
      observer.observe(root)
      return () => observer.disconnect()
    }, [])

    const cards = () =>
      Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []
      )
    const onKeyDown = (
      event: ReactKeyboardEvent<HTMLDivElement>,
      index: number
    ) => {
      const step =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault()
        if (usable(options[index]!)) select(options[index]!.value)
        return
      }
      if (!step && event.key !== "Home" && event.key !== "End") return
      event.preventDefault()
      const count = options.length
      const rtl =
        step &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        getComputedStyle(event.currentTarget).direction === "rtl"
          ? -1
          : 1
      let at = event.key === "Home" ? -1 : event.key === "End" ? count : index
      const dir =
        event.key === "Home" ? 1 : event.key === "End" ? -1 : step * rtl
      for (let tries = 0; tries < count; tries++) {
        at = (at + dir + count) % count
        if (usable(options[at]!)) {
          cards()[at]?.focus()
          select(options[at]!.value)
          return
        }
      }
    }

    return (
      <LazyMotion features={domAnimation}>
        <div
          ref={rootRef}
          role="radiogroup"
          aria-disabled={disabled || undefined}
          aria-required={required || undefined}
          className={cn(
            "group/radio relative grid gap-[10px] font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] text-[var(--foreground)] data-[layout=grid]:grid-cols-[repeat(auto-fill,minmax(min(100%,var(--min-column,180px)),1fr))] data-[layout=list]:grid-cols-[minmax(0,1fr)] data-[layout=list]:gap-[8px]",
            className
          )}
          data-layout={layout}
          style={
            { "--min-column": `${minColumnWidth}px`, ...style } as CSSProperties
          }
          {...rest}
        >
<<<<<<< HEAD
          <m.span
            className="pointer-events-none absolute top-0 left-0 z-[1] rounded-[20px] border-[1.5px] border-solid border-[var(--control-on)]"
            style={{ x, y, width: w, height: h, opacity: o }}
            aria-hidden="true"
          />
          {options.map((option, index) => {
            const checked = index === selectedIndex,
              off = !usable(option)
            const labelId = `${uid}-${index}-label`,
              descriptionId = `${uid}-${index}-description`
            const description =
              off && option.disabledReason
                ? option.disabledReason
                : option.description
            return (
              <div
                key={option.value}
                role="radio"
                data-card={index}
=======
        <m.span
          className="pointer-events-none absolute top-0 left-0 z-[1] rounded-[20px] border-[1.5px] border-solid border-[var(--control-on)]"
          style={{ x, y, width: w, height: h, opacity: o }}
          aria-hidden="true"
        />
        {options.map((option, index) => {
          const checked = index === selectedIndex,
            off = !usable(option)
          const labelId = `${uid}-${index}-label`,
            descriptionId = `${uid}-${index}-description`
          const description =
            off && option.disabledReason
              ? option.disabledReason
              : option.description
          return (
            <div
              key={option.value}
              role="radio"
              data-card={index}
              className={cn(
                "group/card relative grid min-w-0 cursor-pointer items-start gap-x-[12px] gap-y-[4px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-[14px_16px] transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] select-none [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none",
                "group-data-[layout=grid]/radio:grid-cols-[minmax(0,1fr)_auto] group-data-[layout=grid]/radio:grid-rows-[minmax(0,1fr)_auto] group-data-[layout=grid]/radio:[grid-template-areas:'body_indicator'_'meta_meta']",
                "group-data-[layout=list]/radio:grid-cols-[auto_minmax(0,1fr)_auto] group-data-[layout=list]/radio:items-center group-data-[layout=list]/radio:p-[13px_16px_13px_14px] group-data-[layout=list]/radio:[grid-template-areas:'indicator_body_meta']",
                checked &&
                  "bg-[color-mix(in_oklab,var(--control-on)_4%,var(--surface))]",
                off && "cursor-not-allowed bg-[var(--surface-muted)]",
                "hover:not-data-checked:not-aria-disabled:border-[var(--border-strong)] focus-visible:not-data-checked:border-[var(--border-strong)] focus-visible:not-data-checked:bg-[var(--surface-muted)] active:not-data-checked:not-aria-disabled:bg-[var(--surface-muted)]"
              )}
              aria-checked={checked}
              aria-disabled={off || undefined}
              aria-labelledby={labelId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={index === tabStop ? 0 : -1}
              data-checked={checked || undefined}
              onClick={() => {
                if (!off) select(option.value)
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
                className={cn(
                  "group/card relative grid min-w-0 cursor-pointer items-start gap-x-[12px] gap-y-[4px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-[14px_16px] transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] select-none [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none",
                  "group-data-[layout=grid]/radio:grid-cols-[minmax(0,1fr)_auto] group-data-[layout=grid]/radio:grid-rows-[minmax(0,1fr)_auto] group-data-[layout=grid]/radio:[grid-template-areas:'body_indicator'_'meta_meta']",
                  "group-data-[layout=list]/radio:grid-cols-[auto_minmax(0,1fr)_auto] group-data-[layout=list]/radio:items-center group-data-[layout=list]/radio:p-[13px_16px_13px_14px] group-data-[layout=list]/radio:[grid-template-areas:'indicator_body_meta']",
                  checked &&
                    "bg-[color-mix(in_oklab,var(--control-on)_4%,var(--surface))]",
                  off && "cursor-not-allowed bg-[var(--surface-muted)]",
                  "hover:not-data-checked:not-aria-disabled:border-[var(--border-strong)] focus-visible:not-data-checked:border-[var(--border-strong)] focus-visible:not-data-checked:bg-[var(--surface-muted)] active:not-data-checked:not-aria-disabled:bg-[var(--surface-muted)]"
                )}
                aria-checked={checked}
                aria-disabled={off || undefined}
                aria-labelledby={labelId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={index === tabStop ? 0 : -1}
                data-checked={checked || undefined}
                onClick={() => {
                  if (!off) select(option.value)
                }}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
<<<<<<< HEAD
=======
                <m.span
                  className="size-[6px] rounded-[50%] bg-[var(--control-glyph)]"
                  initial={false}
                  animate={{ scale: checked ? 1 : 0 }}
                  transition={
                    reduced ? { duration: 0 } : motionTokens.spring.snappy
                  }
                />
              </span>
              <span className="grid min-w-0 gap-[2px] [grid-area:body]">
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
                <span
                  className={cn(
                    "grid size-[18px] flex-none place-items-center rounded-[50%] border-[1.5px] border-solid border-[var(--border-strong)] transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] [grid-area:indicator] group-data-[layout=grid]/radio:mt-px motion-reduce:transition-none",
                    checked &&
                      "border-[var(--control-on)] bg-[var(--control-on)]",
                    off && "border-[var(--border)]"
                  )}
                  aria-hidden="true"
                >
                  <m.span
                    className="size-[6px] rounded-[50%] bg-[var(--control-glyph)]"
                    initial={false}
                    animate={{ scale: checked ? 1 : 0 }}
                    transition={
                      reduced ? { duration: 0 } : motionTokens.spring.snappy
                    }
                  />
                </span>
                <span className="grid min-w-0 gap-[2px] [grid-area:body]">
                  <span
                    id={labelId}
                    className="flex min-w-0 items-center gap-[8px] font-medium group-aria-disabled/card:text-[var(--text-muted)]"
                  >
                    {option.icon && (
                      <span className="grid size-[18px] flex-none place-items-center text-[var(--text-secondary)] group-data-checked/card:text-[var(--foreground)] [&>svg]:size-[18px]">
                        {option.icon}
                      </span>
                    )}
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {option.label}
                    </span>
                  </span>
                  {description && (
                    <span
                      id={descriptionId}
                      className="text-[length:var(--text-xs)] leading-[var(--leading-body)] text-pretty text-[var(--text-secondary)]"
                    >
                      {description}
                    </span>
                  )}
                </span>
                {option.meta && (
                  <span className="whitespace-nowrap text-[var(--foreground)] tabular-nums [grid-area:meta] group-aria-disabled/card:text-[var(--text-muted)] group-data-[layout=grid]/radio:mt-[10px] group-data-[layout=grid]/radio:text-[length:var(--text-lg)] group-data-[layout=list]/radio:font-medium">
                    {option.meta}
                  </span>
                )}
<<<<<<< HEAD
              </div>
            )
          })}
          {name && (
            <input
              type="hidden"
              name={name}
              value={selected ?? ""}
              required={required}
            />
          )}
=======
              </span>
              {option.meta && (
                <span className="whitespace-nowrap text-[var(--foreground)] tabular-nums [grid-area:meta] group-aria-disabled/card:text-[var(--text-muted)] group-data-[layout=grid]/radio:mt-[10px] group-data-[layout=grid]/radio:text-[length:var(--text-lg)] group-data-[layout=list]/radio:font-medium">
                  {option.meta}
                </span>
              )}
            </div>
          )
        })}
        {name && (
          <input
            type="hidden"
            name={name}
            value={selected ?? ""}
            required={required}
          />
        )}
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
        </div>
      </LazyMotion>
    )
  }
)

export default RadioCards
