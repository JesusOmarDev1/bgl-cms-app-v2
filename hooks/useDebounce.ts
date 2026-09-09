import { useEffect, useState } from "react"
import { useDebounceFn } from "@/hooks/useDebounceFn"
import type { DebounceOptions } from "@/hooks/useDebounceFn"

export function useDebounce<T>(
  value: T,
  debounceMs?: number,
  options?: DebounceOptions
) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  const { run } = useDebounceFn(
    () => {
      setDebouncedValue(value)
    },
    debounceMs,
    options
  )

  useEffect(() => {
    run()
  }, [value, run])

  return debouncedValue
}
