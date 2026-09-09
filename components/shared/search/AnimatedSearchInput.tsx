"use client"

import { BorderBeam } from "border-beam"
import { useReducedMotion } from "motion/react"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { Kbd } from "@/components/ui/kbd"
import { useIsMac } from "@/hooks/useIsMac"
import { cn } from "@/lib/utils"

const DEFAULT_PLACEHOLDERS = [
  "Buscar...",
  "Intenta 'básculas industriales'",
  "¿Qué necesitas hoy?",
]

export type AnimatedSearchInputProps = {
  placeholders?: string[]
  interval?: number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (value: string) => void
  icon?: ReactNode
  className?: string
  inputClassName?: string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onSubmit" | "placeholder"
>

export function AnimatedSearchInput({
  placeholders = DEFAULT_PLACEHOLDERS,
  interval = 3000,
  onChange,
  onSubmit,
  icon,
  className,
  inputClassName,
  ...inputProps
}: AnimatedSearchInputProps) {
  const reduce = useReducedMotion()
  const isMac = useIsMac()
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const shortcutLabel = isMac ? "⌘" : "Ctrl"

  useEffect(() => {
    if (inputValue || reduce || placeholders.length < 2) return

    let nestedTimeout: number | undefined
    const timer = window.setInterval(() => {
      setIsAnimating(true)
      nestedTimeout = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % placeholders.length)
        setIsAnimating(false)
      }, 300)
    }, interval)

    return () => {
      window.clearInterval(timer)
      if (nestedTimeout !== undefined) window.clearTimeout(nestedTimeout)
    }
  }, [placeholders.length, interval, inputValue, reduce])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  const updateSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    onChange?.(event)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = inputValue.trim()
    if (!next) return
    onSubmit?.(next)
  }

  const handleClear = () => {
    setInputValue("")
    inputRef.current?.focus()
  }

  const placeholder = placeholders[currentIndex] ?? "Buscar..."

  return (
    <BorderBeam className={cn("w-full max-w-lg", className)}>
      <form onSubmit={handleSubmit} className="w-full rounded-full">
        <div
          className={cn(
            "relative flex w-full items-center rounded-full border border-input bg-background/60 px-1 shadow-sm backdrop-blur-md transition-colors",
            "focus-within:border-ring hover:border-ring/60"
          )}
        >
          <div className="flex size-12 items-center justify-center text-muted-foreground">
            {icon ?? <MaterialIcon name="search" size={18} />}
          </div>

          <div className="relative h-12 flex-1">
            <label htmlFor="search-input" className="sr-only">
              Buscar
            </label>
            <input
              id="search-input"
              name="search"
              inputMode="search"
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={updateSearchQuery}
              aria-label="Buscar"
              className={cn(
                "h-full w-full bg-transparent pr-4 text-[15px] text-foreground outline-none placeholder:text-transparent focus-visible:ring-0",
                inputClassName
              )}
              {...inputProps}
            />

            {!inputValue ? (
              <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
                <span
                  className={cn(
                    "text-[15px] text-muted-foreground",
                    !reduce &&
                      (isAnimating
                        ? "animate-placeholder-slide-up"
                        : "animate-placeholder-slide-in")
                  )}
                >
                  {placeholder}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pr-3">
            {inputValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            ) : (
              <Kbd className="hidden sm:flex">
                <span>{shortcutLabel}</span>
                <span>K</span>
              </Kbd>
            )}
          </div>
        </div>
      </form>
    </BorderBeam>
  )
}
