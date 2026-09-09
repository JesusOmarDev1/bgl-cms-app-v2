import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react"
import { AnimatedSearchInput } from "@/components/shared/search/AnimatedSearchInput"
import { SearchBarClient } from "@/components/shared/search/SearchBarClient"
import { cn } from "@/lib/utils"

const MINIMAL_PLACEHOLDERS = [
  "Buscar...",
  "Escribe algo...",
  "¿Qué estás buscando?",
]

type SearchBarMode = "command" | "input"

type SearchBarProps = {
  mode?: SearchBarMode
  variant?: "default" | "icon" | "header"
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
  className,
  inputClassName,
  placeholders,
  interval = 3000,
  onChange,
  onSubmit,
  icon,
  ...inputProps
}: SearchBarProps) {
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
        onSubmit={onSubmit}
        icon={icon}
        {...inputProps}
      />
    )
  }

  return <SearchBarClient variant={variant} className={className} />
}

function SearchBarMinimal({
  placeholders = MINIMAL_PLACEHOLDERS,
  interval = 3000,
  onChange,
  onSubmit,
  className,
  ...props
}: Omit<SearchBarProps, "mode" | "variant">) {
  return (
    <SearchBar
      mode="input"
      placeholders={placeholders}
      interval={interval}
      onChange={onChange}
      onSubmit={onSubmit}
      className={cn("max-w-md", className)}
      {...props}
    />
  )
}

export { SearchBar, SearchBarMinimal }
