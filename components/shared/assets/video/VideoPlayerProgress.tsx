import type { Chapter } from "@/components/shared/assets/video/VideoPlayer"

interface VideoPlayerProgressProps {
  currentTime: number
  duration: number
  buffered: number
  chapters: Chapter[]
  hoverTime: number | null
  hoverPosition: number | null
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onProgressHover: (e: React.MouseEvent<HTMLDivElement>) => void
  onProgressLeave: () => void
  onSkip: (seconds: number) => void
  formatTime: (time: number) => string
}

export function VideoPlayerProgress({
  currentTime,
  duration,
  buffered,
  chapters,
  hoverTime,
  hoverPosition,
  onProgressClick,
  onProgressHover,
  onProgressLeave,
  onSkip,
  formatTime,
}: VideoPlayerProgressProps) {
  return (
    <div
      onClick={onProgressClick}
      onMouseMove={onProgressHover}
      onMouseLeave={onProgressLeave}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault()
          onSkip(5)
        } else if (e.key === "ArrowLeft") {
          e.preventDefault()
          onSkip(-5)
        }
      }}
      className="group/progress relative h-4 w-full cursor-pointer rounded-full bg-white/20 transition-all"
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
    >
      {/* Buffered indicator */}
      <div
        className="absolute inset-y-0 left-0 h-4 rounded-full bg-white/40"
        style={{ width: `${buffered}%` }}
      />

      {/* Progress indicator */}
      <div
        className="absolute inset-y-0 left-0 h-4 rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />

      {/* Chapter markers */}
      {chapters.length > 0 && duration > 0 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          {chapters.map((chapter, index) => {
            if (index === 0) return null
            const left = (chapter.startTime / duration) * 100
            return (
              <div
                key={chapter.startTime}
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-black/50"
                style={{ left: `${left}%` }}
              />
            )
          })}
        </div>
      )}

      {/* Scrubber */}
      <div
        className="absolute top-1/2 z-20 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover/progress:opacity-100"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />

      {/* Hover Time Tooltip */}
      {hoverTime !== null && hoverPosition !== null && (
        <div
          className="pointer-events-none absolute bottom-full z-50 mb-4 flex -translate-x-1/2 animate-in flex-col items-center gap-0.5 rounded-lg border border-white/10 bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white duration-150 zoom-in-90 fade-in"
          style={{ left: `${hoverPosition}%` }}
        >
          {chapters.length > 0 && (
            <span className="font-medium text-white/90">
              {
                chapters.find((c, i) => {
                  const nextChapter = chapters[i + 1]
                  return (
                    hoverTime >= c.startTime &&
                    (!nextChapter || hoverTime < nextChapter.startTime)
                  )
                })?.title
              }
            </span>
          )}
          <span className={chapters.length > 0 ? "text-white/70" : ""}>
            {formatTime(hoverTime)}
          </span>
        </div>
      )}
    </div>
  )
}
