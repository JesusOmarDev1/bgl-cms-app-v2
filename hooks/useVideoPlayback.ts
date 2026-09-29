import { useState, useEffect } from "react"
import { formatTime } from "@/lib/formatting/format-time"

export interface QualitySource {
  quality: string
  src: string
}

export interface CaptionTrack {
  src: string
  label: string
  srcLang: string
  default?: boolean
}

interface UseVideoPlaybackOptions {
  src: string | QualitySource[]
  tracks: CaptionTrack[]
  onTimeUpdate?: (time: number) => void
}

export function useVideoPlayback(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { src, tracks, onTimeUpdate }: UseVideoPlaybackOptions
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [quality, setQuality] = useState("auto")
  const [currentSrc, setCurrentSrc] = useState(() =>
    Array.isArray(src) ? src[0]?.src || "" : (src as string)
  )
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [currentCaption, setCurrentCaption] = useState<string | null>(() => {
    if (tracks.length > 0) {
      const defaultTrack = tracks.find((t) => t.default)
      if (defaultTrack) return defaultTrack.srcLang
    }
    return null
  })

  // Sync currentSrc when src prop changes (adjust state during render)
  const [prevSrc, setPrevSrc] = useState(src)
  if (prevSrc !== src) {
    setPrevSrc(src)
    setCurrentSrc(Array.isArray(src) ? src[0]?.src || "" : src)
  }

  const availableQualities = Array.isArray(src)
    ? ["auto", ...src.map((s) => s.quality)]
    : ["auto"]

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] ?? 1
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleQualityChange = (newQuality: string) => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    const wasPlaying = !videoRef.current.paused
    setQuality(newQuality)
    if (Array.isArray(src)) {
      let newSrc = ""
      if (newQuality === "auto") {
        newSrc = src[0]?.src || ""
      } else {
        const source = src.find((s) => s.quality === newQuality)
        if (source) newSrc = source.src
      }
      if (newSrc && newSrc !== currentSrc) {
        setCurrentSrc(newSrc)
        const handleCanPlay = () => {
          if (videoRef.current) {
            videoRef.current.currentTime = time
            if (wasPlaying) videoRef.current.play()
            videoRef.current.removeEventListener(
              "loadedmetadata",
              handleCanPlay
            )
          }
        }
        videoRef.current.addEventListener("loadedmetadata", handleCanPlay)
      }
    }
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const handleToggleLoop = () => {
    if (videoRef.current) {
      videoRef.current.loop = !videoRef.current.loop
      setIsLooping(!isLooping)
    }
  }

  // Sincronizar duration del video nativo.
  // Usamos useEffect con addEventListener nativo porque React's onLoadedMetadata
  // puede no dispararse (el evento loadedmetadata se pierde con preload="metadata").
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const onLoadStart = () => {
      setIsLoading(true)
    }

    const onEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("loadstart", onLoadStart)
    video.addEventListener("ended", onEnded)

    // Si la metadata ya está cargada (readyState >= HAVE_METADATA),
    // seteamos duration inmediatamente
    if (video.readyState >= 1 && video.duration) {
      setDuration(video.duration)
      setIsLoading(false)
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("loadstart", onLoadStart)
      video.removeEventListener("ended", onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    const time = video?.currentTime ?? 0
    const dur = video?.duration ?? 0

    // Fallback: si duration nunca se cargó, lo tomamos del elemento
    if (duration === 0 && dur > 0) {
      setDuration(dur)
      setIsLoading(false)
    }

    setCurrentTime(time)
    if (onTimeUpdate) {
      onTimeUpdate(time)
    }
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      setBuffered((bufferedEnd / (dur || 1)) * 100)
    }
  }

  const togglePictureInPicture = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      // Check if already in PiP (standard or webkit)
      const isInPiP =
        !!(document as any).pictureInPictureElement ||
        !!(document as any).webkitPictureInPictureElement

      if (isInPiP) {
        try {
          await (document as any).exitPictureInPicture?.()
        } catch {
          ;(document as any).webkitExitPictureInPicture?.()
        }
        // State sync via event listener
        return
      }

      // Enter PiP
      try {
        await (video as any).requestPictureInPicture?.()
      } catch {
        ;(video as any).webkitRequestPictureInPicture?.()
      }
      // State sync via event listener
    } catch (error) {
      console.error("[PiP] Error:", error)
    }
  }

  // Sincronizar estado de PiP con eventos del browser
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onEnter = () => setIsPictureInPicture(true)
    const onLeave = () => setIsPictureInPicture(false)

    el.addEventListener("enterpictureinpicture", onEnter)
    el.addEventListener("leavepictureinpicture", onLeave)
    return () => {
      el.removeEventListener("enterpictureinpicture", onEnter)
      el.removeEventListener("leavepictureinpicture", onLeave)
    }
  }, [videoRef])

  const handleCaptionChange = (lang: string | null) => {
    setCurrentCaption(lang)
    if (videoRef.current) {
      const textTracks = videoRef.current.textTracks
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i]
        if (track) {
          if (lang && track.language === lang) {
            track.mode = "showing"
          } else {
            track.mode = "hidden"
          }
        }
      }
    }
  }

  return {
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
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
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
  }
}
