import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import type { CaptionTrack } from "@/hooks/useVideoPlayback"
import { useState } from "react"
import { VideoPlayerTooltip } from "@/components/shared/assets/video/VideoPlayerTooltip"
import { Button } from "@/components/ui/button"

interface VideoPlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  quality: string
  speed: number
  isLooping: boolean
  isFullscreen: boolean
  showControls: boolean
  activeDialog: "settings" | "captions" | "options" | null
  currentCaption: string | null
  availableQualities: string[]
  tracks: CaptionTrack[]
  currentVideoIndex: number
  totalVideos: number
  isPictureInPicture: boolean
  onTogglePlay: () => void
  onSkip: (seconds: number) => void
  onVolumeChange: (volume: number[]) => void
  onToggleMute: () => void
  onQualityChange: (quality: string) => void
  onSpeedChange: (speed: number) => void
  onCaptionChange: (srcLang: string | null) => void
  onPictureInPicture: () => void
  onFullscreen: () => void
  onSetActiveDialog: (
    dialog: "settings" | "captions" | "options" | null
  ) => void
  onToggleLoop: () => void
  onPrevVideo?: () => void
  onNextVideo?: () => void
  formatTime: (time: number) => string
}

function CaptionControl({
  tracks,
  currentCaption,
  activeDialog,
  onCaptionChange,
  onSetActiveDialog,
}: Pick<
  VideoPlayerControlsProps,
<<<<<<< HEAD
  | "tracks"
  | "currentCaption"
  | "activeDialog"
  | "onCaptionChange"
  | "onSetActiveDialog"
=======
  "tracks" | "currentCaption" | "activeDialog" | "onCaptionChange" | "onSetActiveDialog"
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
>) {
  if (!tracks.length) return null
  return (
    <div className="relative flex items-center">
      <VideoPlayerTooltip label="Subtítulos (C)">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (tracks.length === 1 && tracks[0]) {
              onCaptionChange(currentCaption ? null : tracks[0].srcLang)
            } else {
              onSetActiveDialog(activeDialog === "captions" ? null : "captions")
            }
          }}
<<<<<<< HEAD
          className={`flex items-center justify-center rounded-full p-2 transition-all ${
=======
          className={`flex items-center justify-center rounded-full p-2 transition-colors ${
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
            currentCaption
              ? "bg-foreground/30 hover:bg-foreground/40"
              : "hover:bg-white/20"
          }`}
          aria-label="Captions"
        >
          <MaterialIcon
            name="closed_caption"
            size={20}
            className="text-white"
          />
        </Button>
      </VideoPlayerTooltip>
      {activeDialog === "captions" && tracks.length > 1 && (
        <div className="absolute right-0 bottom-full z-50 mb-2 min-w-40 animate-in rounded-lg border border-white/10 bg-black/95 p-3 backdrop-blur-sm duration-150 fade-in slide-in-from-bottom-1">
          <p className="mb-2 text-xs font-semibold text-white uppercase opacity-70">
            Subtítulos
          </p>
          <div className="space-y-1">
            <button
              onClick={() => {
                onCaptionChange(null)
                onSetActiveDialog(null)
              }}
              className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                !currentCaption
                  ? "bg-foreground text-white"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Off
            </button>
            {tracks.map((track) => (
              <button
                key={track.srcLang}
                onClick={() => {
                  onCaptionChange(track.srcLang)
                  onSetActiveDialog(null)
                }}
                className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                  currentCaption === track.srcLang
                    ? "bg-foreground text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsControl({
  activeDialog,
  availableQualities,
  quality,
  speed,
  onSetActiveDialog,
  onQualityChange,
  onSpeedChange,
}: Pick<
  VideoPlayerControlsProps,
  | "activeDialog"
  | "availableQualities"
  | "quality"
  | "speed"
  | "onSetActiveDialog"
  | "onQualityChange"
  | "onSpeedChange"
>) {
  return (
    <div className="relative hidden items-center lg:flex">
      <VideoPlayerTooltip label="Ajustes">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            onSetActiveDialog(activeDialog === "settings" ? null : "settings")
          }
<<<<<<< HEAD
          className={`flex items-center justify-center rounded-full p-2 transition-all ${
=======
          className={`flex items-center justify-center rounded-full p-2 transition-colors ${
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
            activeDialog === "settings"
              ? "bg-foreground/30"
              : "hover:bg-white/20"
          }`}
          aria-label="Settings"
        >
          <MaterialIcon name="settings" size={20} className="text-white" />
        </Button>
      </VideoPlayerTooltip>
      {activeDialog === "settings" && (
        <div className="absolute right-0 bottom-full z-50 mb-2 min-w-40 animate-in rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur-sm duration-150 fade-in slide-in-from-bottom-1">
          {availableQualities.length > 1 && (
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-white uppercase opacity-70">
                Calidad
              </p>
              <div className="space-y-1">
                {availableQualities.map((option) => (
                  <button
                    key={option}
                    onClick={() => onQualityChange(option)}
                    className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                      quality === option
                        ? "bg-foreground text-white"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center">
            <p className="font-semibold text-white">Velocidad</p>
            <div className="space-y-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((option) => (
                <button
                  key={option}
                  onClick={() => onSpeedChange(option)}
                  className={`w-full rounded-2xl px-2 py-1 text-sm transition-colors ${
                    speed === option
                      ? "bg-foreground text-black"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OptionsControl({
  activeDialog,
  isLooping,
  onSetActiveDialog,
  onToggleLoop,
}: Pick<
  VideoPlayerControlsProps,
  "activeDialog" | "isLooping" | "onSetActiveDialog" | "onToggleLoop"
>) {
  return (
    <div className="relative hidden items-center lg:flex">
      <VideoPlayerTooltip label="Mas opciones">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            onSetActiveDialog(activeDialog === "options" ? null : "options")
          }
<<<<<<< HEAD
          className={`flex items-center justify-center rounded-full p-2 transition-all ${
=======
          className={`flex items-center justify-center rounded-full p-2 transition-colors ${
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
            activeDialog === "options"
              ? "bg-foreground/30"
              : "hover:bg-white/20"
          }`}
          aria-label="More options"
        >
          <MaterialIcon name="more_vert" size={20} className="text-white" />
        </Button>
      </VideoPlayerTooltip>
      {activeDialog === "options" && (
        <div className="absolute right-0 bottom-full z-50 mb-2 min-w-48 animate-in rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-sm duration-150 fade-in slide-in-from-bottom-1">
          <Button
            variant="ghost"
            onClick={onToggleLoop}
            className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-sm transition-colors ${
              isLooping
                ? "bg-foreground/30 text-white"
                : "text-white hover:bg-white/10"
            }`}
          >
            <MaterialIcon name="repeat" />
            Repetir
          </Button>
        </div>
      )}
    </div>
  )
}

export function VideoPlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  quality,
  speed,
  isLooping,
  isFullscreen,
  showControls,
  activeDialog,
  currentCaption,
  availableQualities,
  tracks,
  currentVideoIndex,
  totalVideos,
  isPictureInPicture,
  onTogglePlay,
  onSkip,
  onVolumeChange,
  onToggleMute,
  onQualityChange,
  onSpeedChange,
  onCaptionChange,
  onPictureInPicture,
  onFullscreen,
  onSetActiveDialog,
  onToggleLoop,
  onPrevVideo,
  onNextVideo,
  formatTime,
}: VideoPlayerControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  return (
    <div
      className={`absolute right-0 bottom-4 left-0 z-40 mb-6 flex flex-col gap-3 px-4 transition-all duration-200 lg:bottom-4.5 ${showControls ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
    >
      {/* Time Display and Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Left Controls */}
        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <VideoPlayerTooltip
            label={isPlaying ? "Pausa (Espacio)" : "Reproducir (Espacio)"}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePlay}
              className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20"
              aria-label="Play/Pause"
            >
              {isPlaying ? (
                <MaterialIcon
                  name="pause"
                  size={20}
                  className="fill-white text-white"
                />
              ) : (
                <MaterialIcon
                  name="play_arrow"
                  size={20}
                  className="fill-white text-white"
                />
              )}
            </Button>
          </VideoPlayerTooltip>

          {/* Skip Back 10s */}
          <VideoPlayerTooltip label="Retroceder 10 segundos (J)">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSkip(-10)}
              className="hidden items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20 lg:flex"
              aria-label="Skip back 10 seconds"
            >
              <MaterialIcon name="replay_10" size={20} className="text-white" />
            </Button>
          </VideoPlayerTooltip>

          {/* Skip Forward 10s */}
          <VideoPlayerTooltip label="Avanzar 10 segundos (L)">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSkip(10)}
              className="hidden items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20 lg:flex"
              aria-label="Skip forward 10 seconds"
            >
              <MaterialIcon
                name="forward_10"
                size={20}
                className="text-white"
              />
            </Button>
          </VideoPlayerTooltip>

          {/* Previous Video */}
          {currentVideoIndex > 0 && (
            <VideoPlayerTooltip label="Anterior vídeo">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevVideo}
                className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20"
                aria-label="Previous video"
              >
                <MaterialIcon
                  name="chevron_left"
                  size={20}
                  className="text-white"
                />
              </Button>
            </VideoPlayerTooltip>
          )}

          {/* Next Video */}
          {currentVideoIndex < totalVideos - 1 && (
            <VideoPlayerTooltip label="Siguiente vídeo">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextVideo}
                className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20"
                aria-label="Next video"
              >
                <MaterialIcon
                  name="chevron_right"
                  size={20}
                  className="text-white"
                />
              </Button>
            </VideoPlayerTooltip>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-1">
            <VideoPlayerTooltip
              label={isMuted ? "Desmutear (M)" : "Mutear (M)"}
            >
              <Button
                variant="ghost"
                size="icon"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
                onClick={onToggleMute}
                className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20"
                aria-label="Mute/Unmute"
              >
                {isMuted ? (
                  <MaterialIcon
                    name="volume_off"
                    size={20}
                    className="text-white"
                  />
                ) : (
                  <MaterialIcon
                    name="volume_up"
                    size={20}
                    className="text-white"
                  />
                )}
              </Button>
            </VideoPlayerTooltip>

            {/* Volume Slider */}
            <div
              className={`hidden items-center overflow-hidden pl-2 transition-all duration-200 lg:flex ${showVolumeSlider ? "w-20 opacity-100" : "w-0 opacity-0"}`}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                aria-label="Volumen"
                onChange={(e) =>
                  onVolumeChange([Number.parseFloat(e.target.value)])
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full focus:outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, white ${isMuted ? 0 : volume * 100}%, rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume * 100}%)`,
                }}
              />
            </div>
          </div>

          {/* Time Display */}
          <span className="ml-2 hidden min-w-24 items-center font-mono text-sm text-white lg:flex">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          <CaptionControl
            tracks={tracks}
            currentCaption={currentCaption}
            activeDialog={activeDialog}
            onCaptionChange={onCaptionChange}
            onSetActiveDialog={onSetActiveDialog}
          />

          {/* Picture-in-Picture */}
          <VideoPlayerTooltip label="Imagen dentro de imagen (P)">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPictureInPicture}
              className={`flex items-center justify-center rounded-full p-2 transition-all ${
                isPictureInPicture
                  ? "bg-foreground/30 hover:bg-foreground/40"
                  : "hover:bg-white/20"
              }`}
              aria-label="Picture in Picture"
            >
              <MaterialIcon
                name="picture_in_picture_alt"
                size={20}
                className="text-white"
              />
            </Button>
          </VideoPlayerTooltip>

          <SettingsControl
            activeDialog={activeDialog}
            availableQualities={availableQualities}
            quality={quality}
            speed={speed}
            onSetActiveDialog={onSetActiveDialog}
            onQualityChange={onQualityChange}
            onSpeedChange={onSpeedChange}
          />
<<<<<<< HEAD
=======

>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
          <OptionsControl
            activeDialog={activeDialog}
            isLooping={isLooping}
            onSetActiveDialog={onSetActiveDialog}
            onToggleLoop={onToggleLoop}
          />

          {/* Fullscreen */}
          <VideoPlayerTooltip
            label={
              isFullscreen
                ? "Salir de pantalla completa (F)"
                : "Pantalla completa (F)"
            }
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreen}
              className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/20"
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <MaterialIcon name="fullscreen_exit" className="text-white" />
              ) : (
                <MaterialIcon name="fullscreen" className="text-white" />
              )}
            </Button>
          </VideoPlayerTooltip>
        </div>
      </div>
    </div>
  )
}
