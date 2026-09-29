import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { VideoPlayerControls } from "@/components/shared/assets/video/VideoPlayerControls"
import { VideoPlayerProgress } from "@/components/shared/assets/video/VideoPlayerProgress"
import { useVideoControls } from "@/hooks/useVideoControls"
import { useVideoPlayback } from "@/hooks/useVideoPlayback"
import type { CaptionTrack, QualitySource } from "@/hooks/useVideoPlayback"
import { cn } from "cn"
import type React from "react"
import { useEffect, useImperativeHandle, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

function getTimestamp(): number {
  return Date.now()
}

export interface Chapter {
  title: string
  startTime: number
  endTime: number
}

const EMPTY_TRACKS: CaptionTrack[] = []
const EMPTY_CHAPTERS: Chapter[] = []

const AMBIENT_CANVAS_W = 64
const AMBIENT_CANVAS_H = 36

export interface VideoPlayerProps {
  src: string | QualitySource[]
  tracks?: CaptionTrack[]
  poster?: string
  title?: string
  description?: string
  compact?: boolean
  chapters?: Chapter[]
  onTimeUpdate?: (time: number) => void
  onNextVideo?: () => void
  onPrevVideo?: () => void
  currentVideoIndex?: number
  totalVideos?: number
  className?: string
  ambientBlur?: number
  ambientIntensity?: number
}

export interface VideoPlayerRef {
  seek: (time: number) => void
  play: () => void
  pause: () => void
}

export function VideoPlayer({
  src,
  className,
  tracks = EMPTY_TRACKS,
  poster,
  title: _title,
  description: _description,
  compact: _compact = false,
  chapters = EMPTY_CHAPTERS,
  onTimeUpdate,
  onNextVideo,
  onPrevVideo,
  currentVideoIndex = 0,
  totalVideos = 1,
  ambientBlur = 0,
  ambientIntensity = 0.85,
  ref,
}: VideoPlayerProps & { ref?: React.Ref<VideoPlayerRef> }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null)

  const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    buffered,
    speed,
    isLooping,
    volume,
    isMuted,
    quality,
    currentSrc,
    isPictureInPicture,
    currentCaption,
    availableQualities,
    setCurrentTime,
    setIsPlaying,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handleQualityChange,
    handleSpeedChange,
    handleSkip,
    handleToggleLoop,
    handleTimeUpdate,
    togglePictureInPicture,
    handleCaptionChange,
    formatTime,
  } = useVideoPlayback(videoRef, { src, tracks, onTimeUpdate })

  const {
    showControls,
    isFullscreen,
    activeDialog,
    setActiveDialog,
    toggleFullscreen,
  } = useVideoControls(containerRef, isPlaying, videoRef)

  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [doubleTapAction, setDoubleTapAction] = useState<{
    side: "left" | "right"
    id: number
  } | null>(null)
  const lastTapRef = useRef<{ time: number; x: number } | null>(null)
  const tapTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const containerRectRef = useRef<DOMRect | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    containerRectRef.current = container.getBoundingClientRect()
    const ro = new ResizeObserver(() => {
      containerRectRef.current = container.getBoundingClientRect()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const handleTap = (e?: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimestamp()

    // Keyboard-triggered tap (no coordinates) — just toggle play
    if (!e) {
      togglePlay()
      return
    }

    const rect =
      containerRectRef.current ?? containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const clientX = e.clientX
    const x = clientX - rect.left
    const width = rect.width
    const isLeft = x < width * 0.3
    const isRight = x > width * 0.7

    if (!isLeft && !isRight) {
      togglePlay()
      return
    }

    if (lastTapRef.current && time - lastTapRef.current.time < 300) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }

      if (isLeft) {
        handleSkip(-10)
        setDoubleTapAction({ side: "left", id: time })
      } else {
        handleSkip(10)
        setDoubleTapAction({ side: "right", id: time })
      }
      // Clear animation after 1s
      setTimeout(() => setDoubleTapAction(null), 1000)
      lastTapRef.current = null
    } else {
      // First tap
      lastTapRef.current = { time, x }
      tapTimeoutRef.current = setTimeout(() => {
        togglePlay()
        lastTapRef.current = null
      }, 300)
    }
  }

  useImperativeHandle(ref, () => ({
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time
        setCurrentTime(time)
      }
    },
    play: () => {
      videoRef.current?.play()
    },
    pause: () => {
      videoRef.current?.pause()
    },
  }))

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Handle progress bar hover
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = Math.max(0, Math.min(percent * duration, duration))
    setHoverTime(time)
    setHoverPosition(percent * 100)
  }

  const handleProgressLeave = () => {
    setHoverTime(null)
    setHoverPosition(null)
  }

  useEffect(() => {
    // Solo activar si ambientBlur > 0 y NO estamos en PiP
    const blur = ambientBlur ?? 0
    if (blur <= 0 || isPictureInPicture) return

    const video = videoRef.current
    const canvas = ambientCanvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rafId = 0

    const draw = () => {
      if (!video.paused || video.readyState >= 2) {
        try {
          ctx.drawImage(video, 0, 0, AMBIENT_CANVAS_W, AMBIENT_CANVAS_H)
        } catch {
          // cross-origin restrictions
        }
      }
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [ambientBlur, isPictureInPicture])

  return (
    <div
      ref={containerRef}
      className={cn(
        "group w-end-full relative rounded-2xl bg-black",
        className
      )}
    >
      {(ambientBlur ?? 0) > 0 && (
        <canvas
          ref={ambientCanvasRef}
          width={AMBIENT_CANVAS_W}
          height={AMBIENT_CANVAS_H}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-50 scale-110 lg:scale-95"
          style={{
            width: "100%",
            height: "100%",
            filter: `blur(${ambientBlur ?? 100}px)`,
            opacity: ambientIntensity ?? 0.8,
            zIndex: 0,
          }}
        />
      )}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg transition-all duration-300">
        {/* biome-ignore lint/a11y/useMediaCaption: Video player component may not have captions */}
        <video
          ref={videoRef}
          src={currentSrc}
          poster={poster}
          preload="metadata"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="absolute inset-0 h-full w-full"
          style={{ zIndex: 1 }}
        >
          {tracks.map((track) => (
            <track
              key={track.src}
              kind="captions"
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="animate-spin">
              <MaterialIcon
                name="progress_activity"
                size={48}
                className="text-white"
              />
            </div>
          </div>
        )}

        {/* Controls Background Gradient */}
        <div
          className={`absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0"}`}
        />

        {/* Click Overlay */}
        <div
          className="absolute inset-0 z-10"
          onClick={handleTap}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleTap()
            }
          }}
          role="button"
          aria-label="Play/Pause"
          tabIndex={0}
        />

        {/* Double Tap Animation */}
        {doubleTapAction && (
          <div
            key={doubleTapAction.id}
            className={`absolute inset-y-0 ${
              doubleTapAction.side === "left"
                ? "left-0 justify-start pl-12"
                : "right-0 justify-end pr-12"
            } pointer-events-none z-20 flex w-1/2 items-center`}
          >
            <div className="flex animate-in flex-col items-center justify-center rounded-full shadow-lg duration-500 fade-in zoom-in">
              {doubleTapAction.side === "left" ? (
                <>
                  <MaterialIcon
                    name="keyboard_double_arrow_left"
                    size={32}
                    className="text-white"
                  />
                  <span className="mt-1 text-xs font-bold text-white shadow-lg select-none">
                    10s
                  </span>
                </>
              ) : (
                <>
                  <MaterialIcon
                    name="keyboard_double_arrow_right"
                    size={32}
                    className="text-white"
                  />
                  <span className="mt-1 text-xs font-bold text-white shadow-lg select-none">
                    10s
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Center Play Button */}
        {showControls && !isPlaying && (
          <div className="pointer-events-none absolute inset-0 z-20 flex animate-in items-center justify-center duration-200 fade-in">
            <Button
              className="mb-4 h-14 w-14 sm:mb-0 lg:h-24 lg:w-24"
              onClick={togglePlay}
              variant="glass"
              size="icon"
              aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  togglePlay()
                }
              }}
            >
              <MaterialIcon
                name="play_arrow"
                size={48}
                className="fill-white text-white"
              />
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        <div
          className={`absolute right-0 bottom-0 left-0 z-40 px-4 py-3 transition-all duration-200 ${showControls ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
        >
          <VideoPlayerProgress
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            chapters={chapters}
            hoverTime={hoverTime}
            hoverPosition={hoverPosition}
            onProgressClick={handleProgressClick}
            onProgressHover={handleProgressHover}
            onProgressLeave={handleProgressLeave}
            onSkip={handleSkip}
            formatTime={formatTime}
          />
        </div>

        <VideoPlayerControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          quality={quality}
          speed={speed}
          isLooping={isLooping}
          isFullscreen={isFullscreen}
          showControls={showControls}
          activeDialog={activeDialog}
          currentCaption={currentCaption}
          availableQualities={availableQualities}
          tracks={tracks}
          currentVideoIndex={currentVideoIndex}
          totalVideos={totalVideos}
          isPictureInPicture={isPictureInPicture}
          onTogglePlay={togglePlay}
          onSkip={handleSkip}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onQualityChange={handleQualityChange}
          onSpeedChange={handleSpeedChange}
          onCaptionChange={handleCaptionChange}
          onPictureInPicture={togglePictureInPicture}
          onFullscreen={toggleFullscreen}
          onSetActiveDialog={setActiveDialog}
          onToggleLoop={handleToggleLoop}
          onPrevVideo={onPrevVideo}
          onNextVideo={onNextVideo}
          formatTime={formatTime}
        />
      </div>
    </div>
  )
}
