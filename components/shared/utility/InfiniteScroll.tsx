"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Classic } from "@/components/shared/spinners/Classic"

interface InfiniteScrollProps {
  isLoading: boolean
  hasMore: boolean
  next: () => unknown
  threshold?: number
  root?: Element | Document | null
  rootMargin?: string
  reverse?: boolean
  hasError?: boolean
  showSpinner?: boolean
  children?: React.ReactNode
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = "0px",
  reverse,
  showSpinner = true,
  children,
}: InfiniteScrollProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || isLoading) return

    let safeThreshold = threshold
    if (threshold < 0 || threshold > 1) {
      safeThreshold = 1
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          next()
        }
      },
      { threshold: safeThreshold, root, rootMargin }
    )
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, next, threshold, root, rootMargin])

  const flattenChildren = React.Children.toArray(children)

  return (
    <>
      <Button
        className="sr-only focus:not-sr-only focus:relative focus:static focus:h-auto focus:w-auto focus:p-2"
        aria-label="Cargar más elementos"
        onClick={next}
        isDisabled={!hasMore || isLoading}
      >
        Cargar más elementos
      </Button>
      {reverse && <div ref={sentinelRef} style={{ height: 1 }} />}
      {flattenChildren}
      {!reverse && <div ref={sentinelRef} style={{ height: 1 }} />}
      {showSpinner && isLoading && (
        <div
          className="flex justify-center pt-4"
          role="status"
          aria-label="Cargando más elementos"
        >
          <Classic />
        </div>
      )}
    </>
  )
}
