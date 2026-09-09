import { debounce } from "es-toolkit"
import { useEffect, useMemo } from "react"
import type { DebounceOptions } from "es-toolkit"

export type { DebounceOptions }

type DebounceCallback = Parameters<typeof debounce>[0]

export function useDebounceFn<Fn extends DebounceCallback>(
  fn: Fn,
  debounceMs = 1000,
  options?: DebounceOptions
) {
  const debouncedFn = useMemo(
    () => debounce(fn, debounceMs, options),
    [fn, debounceMs, options]
  )

  useEffect(() => () => debouncedFn.cancel(), [debouncedFn])

  return {
    run: debouncedFn,
    cancel: debouncedFn.cancel,
    flush: debouncedFn.flush,
  }
}
