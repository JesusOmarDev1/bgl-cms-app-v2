import { debounce } from "es-toolkit"
import { useEffect, useMemo, useRef } from "react"
import type { DebounceOptions } from "es-toolkit"

export type { DebounceOptions }

export function useDebounceFn<Fn extends (...args: any[]) => any>(
  fn: Fn,
  debounceMs?: number,
  options?: DebounceOptions
) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const debouncedFn = useMemo(
    () =>
      debounce(
        (...args: Parameters<Fn>) => fnRef.current!(...args),
        debounceMs ?? 1000,
        options
      ),
    [debounceMs, options]
  )

  useEffect(() => () => debouncedFn.cancel(), [debouncedFn])

  return {
    run: debouncedFn,
    cancel: debouncedFn.cancel,
    flush: debouncedFn.flush,
  }
}
