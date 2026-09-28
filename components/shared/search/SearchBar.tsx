"use client"

import {
  useTransition,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import { AnimatedSearchInput } from "@/components/shared/search/AnimatedSearchInput"
import { SearchBarClient } from "@/components/shared/search/SearchBarClient"
import { cn } from "cn"

const MINIMAL_PLACEHOLDERS = [
  "Buscar...",
  "Escribe algo...",
  "¿Qué estás buscando?",
]

type SearchBarMode = "command" | "input"

type SearchBarProps = {
  mode?: SearchBarMode
  variant?: "default" | "icon" | "header"
  /** False keeps the palette inside a parent modal instead of portaling to body. */
  portaled?: boolean
  onNavigate?: () => void
  onPaletteOpenChange?: (open: boolean) => void
  className?: string
  inputClassName?: string
  placeholders?: string[]
  interval?: number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (value: string) => void
  icon?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSubmit">

function SearchBar({
  mode,
  variant = "default",
  portaled = true,
  onNavigate,
  onPaletteOpenChange,
  className,
  inputClassName,
  placeholders,
  interval = 3000,
  onChange,
  onSubmit,
  icon,
  ...inputProps
}: SearchBarProps) {
  const [isPending, startTransition] = useTransition()
  const inferredInputMode =
    mode === "input" ||
    Boolean(placeholders) ||
    Boolean(onSubmit) ||
    Boolean(inputClassName)

  if (inferredInputMode) {
    return (
      <AnimatedSearchInput
        className={className}
        inputClassName={inputClassName}
        placeholders={placeholders}
        interval={interval}
        onChange={onChange}
        onSubmit={(value) => {
          startTransition(() => {
            onSubmit?.(value)
          })
        }}
        icon={icon}
        {...inputProps}
        disabled={isPending || Boolean(inputProps.disabled)}
        aria-busy={isPending}
      />
    )
  }

  return (
    <SearchBarClient
      variant={variant}
      className={className}
      portaled={portaled}
      onNavigate={onNavigate}
      onPaletteOpenChange={onPaletteOpenChange}
    />
  )
}

function SearchBarMinimal({
  placeholders = MINIMAL_PLACEHOLDERS,
  interval = 3000,
  onChange,
  onSubmit,
  className,
  ...props
}: Omit<SearchBarProps, "mode" | "variant">) {
  const [isPending, startTransition] = useTransition()
  return (
    <SearchBar
      mode="input"
      placeholders={placeholders}
      interval={interval}
      onChange={onChange}
      onSubmit={(value) => {
        startTransition(() => {
          onSubmit?.(value)
        })
      }}
      className={cn("max-w-md", className)}
      disabled={isPending || Boolean(props.disabled)}
      aria-busy={isPending}
      {...props}
    />
  )
}

export { SearchBar, SearchBarMinimal }
