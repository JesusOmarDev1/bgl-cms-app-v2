"use client"

import {
  Children,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { cn } from "cn"

const CYCLE_INTERVAL = 4000
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot() {
  return false
}

interface MarqueeFadeProps {
  children: React.ReactNode
  pauseOnHover?: boolean
  className?: string
}

export function MarqueeFade({
  children,
  pauseOnHover = false,
  className,
}: MarqueeFadeProps) {
  const slides = Children.toArray(children)
  const slideCount = slides.length
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [active, setActive] = useState(0)

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "100px" }
    )
    const el = containerRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const shouldPlay =
    slideCount > 1 && isInView && !reduceMotion && !(pauseOnHover && isPaused)

  useEffect(() => {
    if (!shouldPlay) return
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slideCount)
    }, CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [shouldPlay, slideCount])

  if (slideCount === 0) return null

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true)
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsPaused(false)
      }}
    >
      {slides.map((slide, index) => (
        <div
          aria-hidden={index !== active}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            index === active ? "opacity-100" : "opacity-0"
          )}
          key={index}
        >
          {slide}
        </div>
      ))}
    </div>
  )
}
