import { useEffect, useRef, useState } from "react"

type ActiveDialog = "settings" | "options" | "captions" | null

export function useVideoControls(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isPlaying: boolean,
  videoRef?: React.RefObject<HTMLVideoElement | null>
) {
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)

  const controlsTimeoutRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as Document & { webkitFullscreenElement?: Element })
            .webkitFullscreenElement
        )
      )
    }
    document.addEventListener("fullscreenchange", handleFSChange)
    document.addEventListener("webkitfullscreenchange", handleFSChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange)
      document.removeEventListener("webkitfullscreenchange", handleFSChange)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const showControlsTemporarily = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    container.addEventListener("mousemove", showControlsTemporarily)
    container.addEventListener("touchstart", showControlsTemporarily, {
      passive: true,
    })
    return () => {
      container.removeEventListener("mousemove", showControlsTemporarily)
      container.removeEventListener("touchstart", showControlsTemporarily)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, containerRef])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element })
        .webkitFullscreenElement
    )

    if (!isCurrentlyFullscreen) {
      const el = containerRef.current
      const elAny = el as unknown as {
        requestFullscreen?: () => Promise<void>
        webkitRequestFullscreen?: () => void
      }

      try {
        if (elAny.requestFullscreen) {
          elAny.requestFullscreen().catch(() => {})
        } else if (elAny.webkitRequestFullscreen) {
          elAny.webkitRequestFullscreen()
        } else if (videoRef?.current) {
          // iOS Safari: webkitEnterFullscreen solo existe en <video>
          const videoAny = videoRef.current as unknown as {
            webkitEnterFullscreen?: () => void
          }
          if (videoAny.webkitEnterFullscreen) {
            videoAny.webkitEnterFullscreen()
          }
        }
      } catch {
        // Silent fail
      }
    } else {
      const docAny = document as unknown as {
        exitFullscreen?: () => Promise<void>
        webkitExitFullscreen?: () => void
      }

      if (docAny.exitFullscreen) {
        docAny.exitFullscreen().catch(() => {})
      } else if (docAny.webkitExitFullscreen) {
        docAny.webkitExitFullscreen()
      }
    }
  }

  return {
    showControls,
    isFullscreen,
    activeDialog,
    setActiveDialog,
    toggleFullscreen,
  }
}
