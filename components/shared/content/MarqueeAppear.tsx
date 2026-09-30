import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { cn } from "cn"

const CYCLE_INTERVAL = 1600
const STAGGER_DELAY = 125

interface MarqueeAppearProps {
  children: React.ReactNode
  columnCount?: number
  direction?: "ltr" | "rtl"
  pauseOnHover?: boolean
  className?: string
}

export function MarqueeAppear({
  children,
  columnCount = 4,
  direction = "ltr",
  pauseOnHover = false,
  className,
}: MarqueeAppearProps) {
  const columns = useMemo(
    () => distributeLogos(Children.toArray(children), columnCount),
    [children, columnCount]
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "100px" }
    )

    const el = containerRef.current
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [])

  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener("change", handler)

    return () => mq.removeEventListener("change", handler)
  }, [])

  const [activeIndices, setActiveIndices] = useState<number[]>(() =>
    columns.map(() => 0)
  )

  const columnsRef = useRef(columns)
  useEffect(() => {
    columnsRef.current = columns
  })

  const [isPaused, setIsPaused] = useState(false)

  const shouldPlay = isInView && !reduceMotion && !(pauseOnHover && isPaused)

  useEffect(() => {
    if (!shouldPlay) return

    const advanceWave = () => {
      setActiveIndices((prev) =>
        columnsRef.current.map(
          (column, columnIndex) =>
            ((prev[columnIndex] ?? 0) + 1) % column.length
        )
      )
    }

    const beatId = setInterval(advanceWave, CYCLE_INTERVAL)
    return () => clearInterval(beatId)
  }, [shouldPlay])

  if (columns.length === 0) return null

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true)
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsPaused(false)
      }}
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((columnLogos, columnIndex) => {
        const waveIndex =
          direction === "rtl" ? columns.length - 1 - columnIndex : columnIndex
        const activeIndex = activeIndices[columnIndex] ?? 0
        const delay = reduceMotion ? 0 : waveIndex * STAGGER_DELAY

        return (
          <div key={columnIndex} className="relative">
            <div
              key={`${columnIndex}-${activeIndex}`}
              className={cn(
                "flex items-center justify-center",
                !reduceMotion &&
                  "animate-blur-in animate-duration-1000 animate-ease-in-out"
              )}
              style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
            >
              {columnLogos[activeIndex]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function distributeLogos(
  logos: ReactNode[],
  columnCount: number
): ReactNode[][] {
  const effectiveCount = Math.min(columnCount, logos.length)
  const columns: ReactNode[][] = Array.from(
    { length: effectiveCount },
    () => []
  )

  logos.forEach((logo, index) => {
    columns[index % effectiveCount].push(logo)
  })

  return columns
}
