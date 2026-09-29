import type React from "react"
import { useState } from "react"

interface VideoPlayerTooltipProps {
  children: React.ReactNode
  label: string
}

export function VideoPlayerTooltip({
  children,
  label,
}: VideoPlayerTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setIsHovered((prev) => !prev)
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
      <div
        className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 font-mono text-xs whitespace-nowrap text-white transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        {label}
      </div>
    </div>
  )
}
