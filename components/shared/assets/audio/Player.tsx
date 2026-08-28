"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"
import { useAudio } from "@/hooks/useAudio"
import { useAudioStore, type InsertMode } from "@/lib/audio/audio-store"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import { formatDuration, type Track } from "@/lib/audio/html-audio"
import { cn } from "@/lib/utils"
import { Fader } from "@/components/shared/assets/audio/Fader"
import { Transport } from "@/components/shared/assets/audio/Transport"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandInput, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SortableDragHandle,
  SortableItem,
  SortableList,
} from "@/components/shared/assets/audio/SortableList"
import { Spinner } from "@/components/ui/spinner"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { useAudioProvider } from "@/hooks/useAudioProvider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const PLAYBACK_SPEEDS = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
] as const

function AudioProvider({
  tracks,
  children,
}: {
  tracks: Track[]
  children: React.ReactNode
}) {
  useAudioProvider({ tracks })
  return <>{children}</>
}

const audioPlayerVariants = cva(
  "relative w-full before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-xl before:backdrop-saturate-150",
  {
    variants: {
      size: {
        sm: "rounded-3xl py-3",
        default: "rounded-4xl py-4",
      },
      variant: {
        default:
          "bg-card/70 shadow-md ring-1 ring-foreground/5 dark:ring-foreground/10",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

type AudioPlayerProps = React.ComponentProps<"div"> &
  VariantProps<typeof audioPlayerVariants> & { tracks?: Track[] }

function AudioPlayer({
  children,
  className,
  tracks,
  size,
  variant,
  ...props
}: AudioPlayerProps) {
  const errorMessage = useAudioStore((state: any) => state.errorMessage)

  const content = (
    <div
      className={cn(audioPlayerVariants({ size, variant }), className)}
      data-size={size ?? "default"}
      data-slot="audio-player"
      data-variant={variant ?? "default"}
      role="presentation"
      {...props}
    >
      {errorMessage && (
        <div className="sr-only" role="alert" aria-live="polite">
          {errorMessage}
        </div>
      )}
      {children}
    </div>
  )

  if (tracks) {
    return <AudioProvider tracks={tracks}>{content}</AudioProvider>
  }

  return content
}

interface AudioPlayerButtonProps extends React.ComponentProps<typeof Button> {
  tooltipLabel?: string
}

function AudioPlayerButton({
  tooltipLabel,
  className,
  ...props
}: AudioPlayerButtonProps) {
  const button = (
    <Button
      aria-label={props["aria-label"] ?? tooltipLabel}
      className={cn("[&_svg]:text-foreground", className)}
      data-slot="audio-player-button"
      {...props}
    />
  )

  if (tooltipLabel) {
    return (
      <Tooltip>
        <TooltipTrigger>{button}</TooltipTrigger>
        <div className="text-zinc-950">{tooltipLabel}</div>
      </Tooltip>
    )
  }

  return button
}

const audioControlBarVariants = cva(
  "flex w-full min-w-0 items-center gap-4 px-4 in-data-[size=sm]:gap-3 in-data-[size=sm]:px-3",
  {
    variants: {
      variant: {
        compact: "flex-row",
        stacked: "flex-col",
      },
    },
    defaultVariants: {
      variant: "compact",
    },
  }
)

type AudioPlayerControlBarProps = React.ComponentProps<"div"> &
  VariantProps<typeof audioControlBarVariants>

const AudioPlayerControlBar = ({
  className,
  variant,
  ...props
}: AudioPlayerControlBarProps) => (
  <div
    className={cn(audioControlBarVariants({ variant }), className)}
    data-slot="audio-control-bar"
    data-variant={variant}
    {...props}
  />
)

type AudioPlayerControlGroupProps = React.ComponentProps<"div">

const AudioPlayerControlGroup = ({
  className,
  ...props
}: AudioPlayerControlGroupProps) => (
  <div
    className={cn(
      "flex w-full items-center gap-3 in-data-[size=sm]:gap-2",
      className
    )}
    data-slot="audio-control-group"
    {...props}
  />
)

type AudioPlayerTimeDisplayProps = React.ComponentProps<"time"> & {
  remaining?: boolean
}

const AudioPlayerTimeDisplay = ({
  className,
  remaining,
  ...props
}: AudioPlayerTimeDisplayProps) => {
  const currentTime = useAudioStore((state) => state.currentTime)
  const duration = useAudioStore((state) => state.duration)
  const { htmlAudio } = useAudio()
  const isLiveStream = htmlAudio.isLive(duration)

  const formattedCurrentTime = formatDuration(currentTime)
  const formattedRemainingTime = formatDuration(duration - currentTime)
  let timeValue = formattedCurrentTime
  if (remaining) {
    timeValue = formattedRemainingTime
  }
  if (isLiveStream && remaining) {
    timeValue = "LIVE"
  }

  const showLiveIcon = isLiveStream && remaining

  return (
    <time
      className={cn(
        "min-w-12 shrink-0 text-left font-mono text-sm tabular-nums",
        remaining && "text-right",
        showLiveIcon && "flex items-center gap-1 text-xs text-red-500",
        className
      )}
      data-live={isLiveStream ? "true" : undefined}
      data-remaining={remaining ? "true" : undefined}
      data-slot="audio-time-display"
      {...props}
    >
      {showLiveIcon && (
        <MaterialIcon
          className="size-3 shrink-0 animate-pulse"
          name="cell_tower"
        />
      )}
      {timeValue}
    </time>
  )
}

const AudioPlayerSeekBar = ({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Transport>,
  "value" | "onSeek" | "bufferedValue"
>) => {
  const currentTime = useAudioStore((state) => state.currentTime)
  const duration = useAudioStore((state) => state.duration)
  const seek = useAudioStore((state) => state.seek)
  const bufferedTime = useAudioStore((state) => state.bufferedTime)
  const { htmlAudio } = useAudio()
  const isLiveStream = htmlAudio.isLive(duration)

  let progress = 0
  if (isLiveStream) {
    progress = 100
  } else if (duration) {
    progress = (currentTime / duration) * 100
  }

  let bufferedProgress = 0
  if (isLiveStream) {
    bufferedProgress = 100
  } else if (duration) {
    bufferedProgress = (bufferedTime / duration) * 100
  }

  return (
    <Transport
      aria-label="Seek"
      bufferedValue={bufferedProgress}
      className={cn("min-w-20 flex-1", className)}
      data-slot="audio-seek-bar"
      disabled={isLiveStream}
      freezeValuesWhileDragging
      onSeek={(nextProgress) => {
        if (!isLiveStream && duration > 0) {
          const newTime = (nextProgress / 100) * duration
          seek(newTime)
        }
      }}
      value={progress}
      {...props}
    />
  )
}

const AudioPlayerVolume = ({
  className,
  size = "icon",
  variant = "outline",
  ...props
}: Omit<
  React.ComponentProps<typeof Fader>,
  "value" | "onValueChange" | "min" | "max" | "orientation" | "size"
> & {
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
}) => {
  const volume = useAudioStore((state) => state.volume)
  const isMuted = useAudioStore((state) => state.isMuted)
  const setVolume = useAudioStore((state) => state.setVolume)
  const toggleMute = useAudioStore((state) => state.toggleMute)

  const volumePercent = Math.round(volume * 100)
  const effectiveVolumePercent = isMuted ? 0 : volumePercent

  const getVolumeIconName = () => {
    if (isMuted || volume === 0) {
      return "volume_off"
    }
    if (volumePercent < 33) {
      return "volume_mute"
    }
    if (volumePercent < 66) {
      return "volume_down"
    }
    return "volume_up"
  }

  const iconName = getVolumeIconName()

  const handleVolumeChange = React.useCallback(
    (nextVolumePercent: number) => {
      setVolume({ volume: nextVolumePercent / 100 })
    },
    [setVolume]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AudioPlayerButton
          className={cn("flex", className)}
          data-slot="audio-volume-button"
          size={size}
          tooltipLabel={
            isMuted
              ? "Muteado"
              : `Volumen ${Math.round(effectiveVolumePercent)}%`
          }
          variant={variant}
        >
          <MaterialIcon
            className={cn(isMuted && "opacity-40")}
            name={iconName}
          />
        </AudioPlayerButton>
      </DropdownMenuTrigger>
      <DropdownMenuGroup
        className={cn(
          "flex w-(--dropdown-menu-content-width) flex-col gap-0",
          className
        )}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Volumen</span>
            <output className="font-mono text-xs text-foreground tabular-nums">
              {effectiveVolumePercent}
            </output>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <AudioPlayerButton
                aria-label={isMuted ? "Desmutear" : "Mutear"}
                onClick={toggleMute}
                size="icon"
                tooltipLabel={isMuted ? "Desmutear" : "Mutear"}
                variant="ghost"
              >
                <MaterialIcon
                  className={cn(
                    "text-foreground",
                    isMuted ? "opacity-40" : "opacity-60"
                  )}
                  name="volume_off"
                />
              </AudioPlayerButton>

              <Fader
                max={100}
                min={0}
                onValueChange={handleVolumeChange}
                orientation="horizontal"
                size="sm"
                step={1}
                value={effectiveVolumePercent}
                {...props}
              />
              <AudioPlayerButton
                aria-hidden="true"
                aria-readonly
                isDisabled
                size="icon"
                tooltipLabel="Maximum volume"
                variant="ghost"
              >
                <MaterialIcon
                  aria-hidden="true"
                  className="text-foreground opacity-60"
                  name="volume_up"
                />
              </AudioPlayerButton>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuGroup>
    </DropdownMenu>
  )
}

const AudioPlayerPlay = React.memo(
  ({
    className,
    onClick,
    size = "icon",
    variant = "ghost",
    ...props
  }: React.ComponentProps<typeof AudioPlayerButton>) => {
    const isPlaying = useAudioStore((state) => state.isPlaying)
    const isLoading = useAudioStore((state) => state.isLoading)
    const isBuffering = useAudioStore((state) => state.isBuffering)
    const currentTrack = useAudioStore((state) => state.currentTrack)

    const togglePlay = useAudioStore((state) => state.togglePlay)

    const handleKeyPress = React.useCallback(
      (event: KeyboardEvent) => {
        if (event.code === "Space") {
          const target = event.target as HTMLElement
          if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
          )
            return
          event.preventDefault()
          togglePlay()
        }
      },
      [togglePlay]
    )

    React.useEffect(() => {
      document.addEventListener("keydown", handleKeyPress)
      return () => document.removeEventListener("keydown", handleKeyPress)
    }, [handleKeyPress])

    const showSpinner = isLoading || isBuffering

    const handleClick = React.useCallback(
      (e: Parameters<NonNullable<typeof onClick>>[0]) => {
        onClick?.(e)
        togglePlay()
      },
      [onClick, togglePlay]
    )

    return (
      <AudioPlayerButton
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
        className={cn(className)}
        data-slot="audio-play-button"
        isDisabled={showSpinner || !currentTrack}
        onClick={handleClick}
        size={size}
        tooltipLabel={isPlaying ? "Pausar" : "Reproducir"}
        variant={variant}
        {...props}
      >
        {showSpinner && <Spinner />}
        {!showSpinner && isPlaying && <MaterialIcon name="pause" />}
        {!(showSpinner || isPlaying) && <MaterialIcon name="play_arrow" />}
      </AudioPlayerButton>
    )
  }
)

const AudioPlayerRewind = React.memo(
  ({
    className,
    onClick,
    size = "icon",
    variant = "ghost",
    ...props
  }: React.ComponentProps<typeof AudioPlayerButton>) => {
    const currentTime = useAudioStore((state) => state.currentTime)
    const duration = useAudioStore((state) => state.duration)
    const seek = useAudioStore((state) => state.seek)
    const currentTrack = useAudioStore((state) => state.currentTrack)
    const { htmlAudio } = useAudio()
    const isLiveStream = htmlAudio.isLive(duration)

    const seekBackward = React.useCallback(
      (seconds = 10) => {
        const newTime = Math.max(currentTime - seconds, 0)
        seek(newTime)
      },
      [currentTime, seek]
    )

    const disableSeekBackward =
      !currentTrack || currentTime <= 0 || isLiveStream

    return (
      <AudioPlayerButton
        aria-label={
          isLiveStream
            ? "Saltar hacia atrás deshabilitado"
            : "Saltar hacia atrás"
        }
        className={cn(className)}
        data-slot="audio-rewind-button"
        isDisabled={disableSeekBackward}
        onClick={(e) => {
          onClick?.(e)
          if (!isLiveStream) {
            seekBackward(10)
          }
        }}
        size={size}
        tooltipLabel={
          isLiveStream
            ? "No disponible para transmisiones en vivo"
            : "Saltar hacia atrás"
        }
        variant={variant}
        {...props}
      >
        <MaterialIcon name="fast_rewind" />
      </AudioPlayerButton>
    )
  }
)

const AudioPlayerFastForward = React.memo(
  ({
    className,
    onClick,
    size = "icon",
    variant = "ghost",
    ...props
  }: React.ComponentProps<typeof AudioPlayerButton>) => {
    const currentTime = useAudioStore((state) => state.currentTime)
    const seek = useAudioStore((state) => state.seek)
    const duration = useAudioStore((state) => state.duration)
    const currentTrack = useAudioStore((state) => state.currentTrack)
    const { htmlAudio } = useAudio()
    const isLiveStream = htmlAudio.isLive(duration)

    const seekForward = React.useCallback(
      (seconds = 10) => {
        const newTime = Math.min(currentTime + seconds, duration)
        seek(newTime)
      },
      [duration, seek, currentTime]
    )

    const disableSeekForward =
      !currentTrack || isLiveStream || (duration > 0 && currentTime >= duration)

    return (
      <AudioPlayerButton
        aria-label={
          isLiveStream
            ? "Saltar hacia adelante deshabilitado"
            : "Saltar hacia adelante"
        }
        className={cn(className)}
        data-slot="audio-fast-forward-button"
        isDisabled={disableSeekForward}
        onClick={(e) => {
          onClick?.(e)
          if (!isLiveStream) {
            seekForward(10)
          }
        }}
        size={size}
        tooltipLabel={
          isLiveStream
            ? "No disponible para transmisiones en vivo"
            : "Saltar hacia adelante"
        }
        variant={variant}
        {...props}
      >
        <MaterialIcon name="fast_forward" />
      </AudioPlayerButton>
    )
  }
)

const AudioPlayerSkipForward = React.memo(
  ({
    className,
    onClick,
    size = "icon",
    variant = "ghost",
    ...props
  }: React.ComponentProps<typeof AudioPlayerButton>) => {
    const repeatMode = useAudioStore((state) => state.repeatMode)
    const queueLength = useAudioStore((state) => state.queue.length)
    const currentQueueIndex = useAudioStore((state) => state.currentQueueIndex)
    const currentTrack = useAudioStore((state) => state.currentTrack)

    const next = useAudioStore((state) => state.next)

    const disableNext =
      !currentTrack ||
      (currentQueueIndex === queueLength - 1 && repeatMode !== "all")
    const handleClick = React.useCallback(
      (e: Parameters<NonNullable<typeof onClick>>[0]) => {
        onClick?.(e)
        next()
      },
      [onClick, next]
    )

    return (
      <AudioPlayerButton
        aria-label="Next"
        className={cn(className)}
        data-slot="audio-skip-forward-button"
        isDisabled={disableNext}
        onClick={handleClick}
        size={size}
        tooltipLabel="Next"
        variant={variant}
        {...props}
      >
        <MaterialIcon name="skip_next" />
      </AudioPlayerButton>
    )
  }
)

const AudioPlayerSkipBack = React.memo(
  ({
    className,
    onClick,
    size = "icon",
    variant = "ghost",
    ...props
  }: React.ComponentProps<typeof AudioPlayerButton>) => {
    const repeatMode = useAudioStore((state) => state.repeatMode)
    const currentQueueIndex = useAudioStore((state) => state.currentQueueIndex)
    const currentTrack = useAudioStore((state) => state.currentTrack)

    const previous = useAudioStore((state) => state.previous)

    const disablePrevious =
      !currentTrack || (currentQueueIndex === 0 && repeatMode !== "all")
    const handleClick = React.useCallback(
      (e: Parameters<NonNullable<typeof onClick>>[0]) => {
        onClick?.(e)
        previous()
      },
      [onClick, previous]
    )

    return (
      <AudioPlayerButton
        aria-label="Previous"
        className={cn(className)}
        data-slot="audio-skip-back-button"
        isDisabled={disablePrevious}
        onClick={handleClick}
        size={size}
        tooltipLabel="Previous"
        variant={variant}
        {...props}
      >
        <MaterialIcon name="skip_previous" />
      </AudioPlayerButton>
    )
  }
)

type AudioTrackMediaMode =
  "cover" | "drag-handle" | "drag-handle-with-cover" | "index"

type AudioTrackActionMode =
  "none" | "play-pause" | "remove" | "play-pause-with-remove"

type AudioTrackProps = {
  trackId?: string | number
  track?: Track
  index?: number
  onClick?: () => void
  onRemove?: (trackId: string) => void
  media?: AudioTrackMediaMode
  actions?: AudioTrackActionMode
  className?: string
} & (
  | { trackId: string | number; track?: never }
  | { track: Track; trackId?: never }
  | { trackId?: never; track?: never }
)

function getPlayPauseTitle(isCurrent: boolean, isPlaying: boolean): string {
  if (!isCurrent) {
    return "Reproducir esta pista"
  }
  if (isPlaying) {
    return "Pausar"
  }
  return "Reproducir"
}

function handleTrackRemoveClick(
  e: React.MouseEvent,
  targetTrackId: string | number | undefined,
  onRemove?: (id: string) => void
) {
  e.stopPropagation()
  e.preventDefault()
  if (targetTrackId !== undefined && onRemove) {
    onRemove(String(targetTrackId))
  }
}

function handleTrackPlayPauseClick(
  e: React.MouseEvent,
  isCurrent: boolean,
  trackId: string | number | undefined,
  queueItems: Track[],
  togglePlay: () => void,
  setQueueAndPlay: (tracks: Track[], index: number) => void
) {
  e.stopPropagation()
  e.preventDefault()

  if (isCurrent) {
    togglePlay()
    return
  }

  const trackIndex = queueItems.findIndex((t) => t.id === trackId)
  if (trackIndex >= 0) {
    setQueueAndPlay(queueItems, trackIndex)
  }
}

function renderTrackActions({
  actions,
  isCurrent,
  onRemove,
  onTrackRemoveClick,
  onTrackPlayPauseClick,
  playPauseTitle,
  actualIsPlaying,
}: {
  actions: AudioTrackActionMode
  isCurrent: boolean
  onRemove?: (trackId: string) => void
  onTrackRemoveClick: (e: React.MouseEvent) => void
  onTrackPlayPauseClick: (e: React.MouseEvent) => void
  playPauseTitle: string
  actualIsPlaying: boolean
}) {
  const showRemoveAction =
    (actions === "remove" || actions === "play-pause-with-remove") &&
    !isCurrent &&
    !!onRemove
  const showPlayPauseAction =
    actions === "play-pause" || actions === "play-pause-with-remove"

  return (
    <>
      {showRemoveAction && (
        <Button
          aria-label="Remove track"
          className="[&_svg]:text-primary"
          onClick={onTrackRemoveClick}
          size="icon"
          variant="ghost"
        >
          <MaterialIcon name="close" />
        </Button>
      )}
      {showPlayPauseAction && (
        <Button
          aria-label={playPauseTitle}
          className="[&_svg]:text-primary"
          onClick={onTrackPlayPauseClick}
          size="icon"
          variant="ghost"
        >
          {actualIsPlaying ? (
            <MaterialIcon name="pause" />
          ) : (
            <MaterialIcon name="play_arrow" />
          )}
        </Button>
      )}
    </>
  )
}

function renderTrackMedia(
  media: AudioTrackMediaMode,
  track: Track,
  index?: number
) {
  const coverImage = track.artwork || track.images?.[0]
  const cover = coverImage ? (
    <Avatar>
      <AvatarImage alt={track.title} src={coverImage} />
      <AvatarFallback>
        <MaterialIcon name="music_note" />
      </AvatarFallback>
    </Avatar>
  ) : (
    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
      <MaterialIcon
        className="size-4 text-muted-foreground"
        name="music_note"
      />
    </div>
  )

  switch (media) {
    case "drag-handle-with-cover":
      return (
        <div className="flex items-center gap-2">
          <SortableDragHandle />
          {cover}
        </div>
      )
    case "drag-handle":
      return <SortableDragHandle />
    case "cover":
      return cover
    default: {
      const displayIndex = index !== undefined ? index + 1 : ""
      return (
        <span className="text-xs text-muted-foreground/60">{displayIndex}</span>
      )
    }
  }
}

function AudioTrack({
  trackId,
  track: externalTrack,
  index,
  onClick,
  onRemove,
  media = "cover",
  actions = "play-pause",
  className,
}: AudioTrackProps) {
  const queue = useAudioStore((state) => state.queue)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const duration = useAudioStore((state) => state.duration)
  const togglePlay = useAudioStore((state) => state.togglePlay)
  const setQueueAndPlay = useAudioStore((state) => state.setQueueAndPlay)
  const { htmlAudio } = useAudio()

  const track =
    externalTrack ??
    (trackId ? queue.find((t) => String(t.id) === String(trackId)) : undefined)

  if (!track) {
    return null
  }

  const isCurrent = currentTrack?.id === track.id
  const actualIsPlaying = isPlaying && isCurrent
  const trackDuration = isCurrent && duration > 0 ? duration : track.duration

  const isLiveTrack =
    track.live === true ||
    (trackDuration !== undefined &&
      trackDuration !== null &&
      htmlAudio.isLive(trackDuration))

  const handleRemove = (e: React.MouseEvent) =>
    handleTrackRemoveClick(e, track.id, onRemove)

  const handlePlayPause = (e: React.MouseEvent) =>
    handleTrackPlayPauseClick(
      e,
      isCurrent,
      track.id,
      queue,
      togglePlay,
      setQueueAndPlay
    )
  const playPauseTitle = getPlayPauseTitle(isCurrent, actualIsPlaying)

  return (
    <Item
      className={cn(
        "w-full cursor-pointer backdrop-blur-sm transition-all hover:bg-secondary/50",
        className
      )}
      data-current={isCurrent ? "true" : undefined}
      data-slot="audio-track"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onClick?.()
      }}
      size="sm"
      variant={isCurrent ? "outline" : "default"}
    >
      <ItemMedia>{renderTrackMedia(media, track, index)}</ItemMedia>
      <ItemContent className="min-w-0 flex-1 gap-0 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <ItemTitle>{track.title}</ItemTitle>
          {isLiveTrack && (
            <Badge variant="destructive">
              <MaterialIcon name="cell_tower" />
              Live
            </Badge>
          )}
        </div>
        <ItemDescription>{track.artist}</ItemDescription>
      </ItemContent>
      {!isLiveTrack && trackDuration !== undefined && (
        <ItemContent className="flex-none text-center">
          <ItemDescription>{formatDuration(trackDuration)}</ItemDescription>
        </ItemContent>
      )}
      <ItemActions>
        {renderTrackActions({
          actions,
          isCurrent,
          onRemove,
          onTrackRemoveClick: handleRemove,
          onTrackPlayPauseClick: handlePlayPause,
          playPauseTitle,
          actualIsPlaying,
        })}
      </ItemActions>
    </Item>
  )
}

const audioTrackListVariants = cva("w-full", {
  variants: {
    variant: {
      default: "space-y-2",
      grid: "grid grid-cols-1 gap-2 xl:grid-cols-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type AudioTrackListProps = {
  tracks?: Track[]
  onTrackSelect?: (index: number, track?: Track) => void
  onTrackRemove?: (trackId: string) => void
  mode?: "static" | "sortable"
  media?: "cover" | "index"
  actions?: AudioTrackActionMode
  emptyLabel?: string
  emptyDescription?: string
  filterQuery?: string
  filterFn?: (track: Track) => boolean
  className?: string
} & VariantProps<typeof audioTrackListVariants>

function AudioTrackList({
  tracks: externalTracks,
  onTrackSelect,
  onTrackRemove,
  mode = "static",
  media = "cover",
  actions,
  variant = "default",
  emptyLabel = "No se encontraron pistas",
  emptyDescription = "Intenta añadir algunas pistas",
  filterQuery,
  filterFn,
  className,
}: AudioTrackListProps) {
  const queue = useAudioStore((state) => state.queue)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const setQueueAndPlay = useAudioStore((state) => state.setQueueAndPlay)
  const togglePlay = useAudioStore((state) => state.togglePlay)
  const setQueue = useAudioStore((state) => state.setQueue)
  const currentQueueIndex = useAudioStore((state) => state.currentQueueIndex)

  let tracks = externalTracks ?? queue

  if (filterFn) {
    tracks = tracks.filter(filterFn)
  } else if (filterQuery?.trim()) {
    const query = filterQuery.toLowerCase()
    tracks = tracks.filter(
      (track: Track) =>
        track.title?.toLowerCase().includes(query) ||
        track.artist?.toLowerCase().includes(query)
    )
  }

  const isFiltered = (filterQuery?.trim().length ?? 0) > 0 || !!filterFn
  const isExternalTracks = !!externalTracks
  const resolvedActions: AudioTrackActionMode =
    actions ?? (onTrackRemove ? "play-pause-with-remove" : "play-pause")
  const trackById = React.useMemo(() => {
    const map = new Map<string, Track>()
    for (const track of tracks) {
      if (track.id !== undefined) {
        map.set(String(track.id), track)
      }
    }
    return map
  }, [tracks])
  const trackIndexById = React.useMemo(() => {
    const map = new Map<string, number>()
    tracks.forEach((track, index) => {
      if (track.id !== undefined) {
        map.set(String(track.id), index)
      }
    })
    return map
  }, [tracks])
  const sortableItems = React.useMemo(
    () => Array.from(trackById.keys(), (id) => ({ id })),
    [trackById]
  )

  const handleAutoReorder = (reorderedTracks: Track[]) => {
    if (!(isFiltered || isExternalTracks)) {
      const newIndex =
        currentTrack?.id !== undefined
          ? reorderedTracks.findIndex((t) => t.id === currentTrack.id)
          : -1

      let finalIndex = 0
      if (newIndex >= 0) {
        finalIndex = newIndex
      } else if (
        currentQueueIndex >= 0 &&
        currentQueueIndex < reorderedTracks.length
      ) {
        finalIndex = currentQueueIndex
      }

      setQueue(reorderedTracks, finalIndex)
    }
  }

  if (tracks.length === 0) {
    return (
      <Empty className={cn(className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MaterialIcon name="queue_music" />
          </EmptyMedia>
          <EmptyTitle>{emptyLabel}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const renderTrack = (track: Track, index: number, isOverlay = false) => {
    const handleTrackClick = () => {
      if (isExternalTracks) {
        onTrackSelect?.(index, track)
      } else {
        const queueIndex = queue.findIndex((t) => t.id === track.id)
        if (queueIndex >= 0) {
          if (currentTrack?.id === track.id) {
            togglePlay()
          } else {
            setQueueAndPlay(queue, queueIndex)
          }
          const originalTrack = queue[queueIndex]
          onTrackSelect?.(queueIndex, originalTrack)
        } else {
          onTrackSelect?.(index, track)
        }
      }
    }

    if (!track.id) {
      return null
    }

    let trackMedia: AudioTrackMediaMode = media
    if (mode === "sortable") {
      trackMedia = media === "cover" ? "drag-handle-with-cover" : "drag-handle"
    }

    return (
      <AudioTrack
        actions={resolvedActions}
        index={index}
        key={track.id}
        media={isOverlay ? media : trackMedia}
        onClick={handleTrackClick}
        onRemove={onTrackRemove}
        track={track}
      />
    )
  }

  const content =
    mode === "sortable" ? (
      <SortableList
        className={
          variant === "grid" ? "grid grid-cols-1 gap-2 xl:grid-cols-2" : "gap-1"
        }
        items={sortableItems}
        onChange={(reorderedTracks) => {
          const reorderedFullTracks = reorderedTracks
            .map((item) => trackById.get(item.id))
            .filter((t): t is Track => t !== undefined)
          handleAutoReorder(reorderedFullTracks)
        }}
        renderItem={(item, index, isOverlay = false) => {
          const track = trackById.get(item.id)
          if (!track?.id) {
            return null
          }
          const trackIndex = trackIndexById.get(item.id) ?? index

          const trackContent = renderTrack(track, trackIndex, isOverlay)

          return (
            <SortableItem id={String(track.id)} key={track.id}>
              {trackContent}
            </SortableItem>
          )
        }}
      />
    ) : (
      <div className={cn(audioTrackListVariants({ variant }))}>
        {tracks.map((track, index) => renderTrack(track, index))}
      </div>
    )

  return (
    <ScrollArea
      className={cn("max-h-[36vh] w-full pt-1", className)}
      data-slot="audio-track-list"
    >
      {content}
    </ScrollArea>
  )
}

type AudioQueueProps = {
  onTrackSelect?: (index: number) => void
  searchPlaceholder?: string
  emptyLabel?: string
  emptyDescription?: string
}

const AudioQueueRepeatMode = ({
  className,
  ...props
}: React.ComponentProps<typeof Toggle>) => {
  const repeatMode = useAudioStore((state) => state.repeatMode)
  const changeRepeatMode = useAudioStore((state) => state.changeRepeatMode)
  const handleRepeat = React.useCallback(() => {
    changeRepeatMode()
  }, [changeRepeatMode])

  const iconName = repeatMode === "one" ? "repeat_one" : "repeat"
  let repeatTooltip = "Deshabilitar repetición"
  if (repeatMode === "one") {
    repeatTooltip = "Repite esta pista"
  } else if (repeatMode === "all") {
    repeatTooltip = "Repetir lista de reproducción"
  }

  const isPressed = repeatMode !== "none"

  return (
    <Tooltip>
      <TooltipTrigger>
        <Toggle
          aria-label={repeatTooltip}
          className={cn(
            "[&_svg]:text-primary",
            className,
            isPressed && "bg-accent! text-accent-foreground!"
          )}
          data-slot="audio-queue-repeat-mode"
          onPressChange={handleRepeat}
          onPress={() => handleRepeat}
          {...props}
        >
          <MaterialIcon name={iconName} />
        </Toggle>
      </TooltipTrigger>
      <div className="text-zinc-950">{repeatTooltip}</div>
    </Tooltip>
  )
}

const AudioQueueShuffle = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Toggle>, "onPressedChange">) => {
  const shuffle = useAudioStore((state) => state.shuffle)
  const unshuffle = useAudioStore((state) => state.unshuffle)
  const shuffleEnabled = useAudioStore((state) => state.shuffleEnabled)

  const handleShuffle = React.useCallback(
    (pressed: boolean) => {
      if (pressed) {
        shuffle()
      } else {
        unshuffle()
      }
    },
    [shuffle, unshuffle]
  )

  return (
    <Tooltip>
      <TooltipTrigger>
        <Toggle
          aria-label="Shuffle"
          className={cn(
            "[&_svg]:text-primary",
            className,
            shuffleEnabled && "bg-accent! text-accent-foreground!"
          )}
          data-slot="audio-queue-shuffle"
          onPressChange={handleShuffle}
          onPress={() => handleShuffle(true)}
          {...props}
        >
          <MaterialIcon name="shuffle" />
        </Toggle>
      </TooltipTrigger>
      <div className="text-zinc-950">
        Mezclar {shuffleEnabled ? "activado" : "desactivado"}
      </div>
    </Tooltip>
  )
}

const AudioQueuePreferences = ({
  className,
  variant = "outline",
  size = "icon",
  tooltipLabel = "Preferencias de la cola",
  ...props
}: React.ComponentProps<typeof AudioPlayerButton>) => {
  const repeatMode = useAudioStore((state) => state.repeatMode)
  const setRepeatMode = useAudioStore((state) => state.setRepeatMode)
  const insertMode = useAudioStore((state) => state.insertMode)
  const setInsertMode = useAudioStore((state) => state.setInsertMode)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AudioPlayerButton
          className={cn(className)}
          data-slot="audio-queue-preferences-trigger"
          size={size}
          tooltipLabel={tooltipLabel}
          variant={variant}
          {...props}
        >
          <MaterialIcon name="tune" />
        </AudioPlayerButton>
      </DropdownMenuTrigger>
      <div className="flex w-(--dropdown-menu-content-width) flex-col gap-0">
        <div className="text-zinc-950">Modo de Repetición</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MaterialIcon name="repeat" />
            </div>
            <div className="text-zinc-950">Ninguno</div>
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Insert Mode</DropdownMenuLabel>
          <RadioGroup
            onChange={(value: string) => setInsertMode(value as InsertMode)}
            value={insertMode}
          >
            <RadioGroupItem value="first_page">
              <MaterialIcon name="first_page" />
              Primero
            </RadioGroupItem>
            <RadioGroupItem value="last_page">
              <MaterialIcon name="last_page" />
              Último
            </RadioGroupItem>
            <RadioGroupItem value="after">
              <MaterialIcon name="last_page" />
              Después de la actual
            </RadioGroupItem>
            <RadioGroupItem value="before">
              <MaterialIcon name="last_page" />
              Antes de la actual
            </RadioGroupItem>
          </RadioGroup>
        </DropdownMenuGroup>
      </div>
    </DropdownMenu>
  )
}

const AudioQueue = React.memo(
  ({
    onTrackSelect,
    searchPlaceholder = "Buscar una pista...",
    emptyLabel = "No se encontraron pistas",
    emptyDescription = "Intenta buscar una pista diferente",
  }: AudioQueueProps) => {
    const togglePlay = useAudioStore((state) => state.togglePlay)
    const setQueueAndPlay = useAudioStore((state) => state.setQueueAndPlay)
    const clearQueue = useAudioStore((state) => state.clearQueue)
    const removeFromQueue = useAudioStore((state) => state.removeFromQueue)

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    const normalizedSearchQuery = searchQuery.trim().toLowerCase()
    const isFiltered = normalizedSearchQuery.length > 0

    const handleTrackSelect = React.useCallback(
      (index: number) => {
        const currentState = useAudioStore.getState()
        const currentQueue = currentState.queue
        const currentTrackId = currentState.currentTrack?.id
        let filtered = currentQueue

        if (normalizedSearchQuery) {
          filtered = currentQueue.filter(
            (t: Track) =>
              t.title?.toLowerCase().includes(normalizedSearchQuery) ||
              t.artist?.toLowerCase().includes(normalizedSearchQuery)
          )
        }

        const selectedTrack = filtered[index]
        if (!selectedTrack) {
          return
        }

        const trackIndex = currentQueue.findIndex(
          (t) => t.id === selectedTrack.id
        )
        if (trackIndex < 0) {
          return
        }

        if (currentTrackId === selectedTrack.id) {
          togglePlay()
        } else if (currentQueue.length > 0) {
          setQueueAndPlay(currentQueue, trackIndex)
        }
        onTrackSelect?.(trackIndex)
        setDialogOpen(false)
      },
      [normalizedSearchQuery, togglePlay, setQueueAndPlay, onTrackSelect]
    )

    const handleTrackRemove = React.useCallback(
      (trackId: string) => {
        removeFromQueue(trackId)
      },
      [removeFromQueue]
    )

    const handleClearQueue = React.useCallback(() => {
      clearQueue()
    }, [clearQueue])

    return (
      <Dialog
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen)
          if (!isOpen) {
            setSearchQuery("")
          }
        }}
        isOpen={dialogOpen}
      >
        <DialogTrigger>
          <AudioPlayerButton
            data-slot="audio-queue-trigger"
            size="icon"
            tooltipLabel="Cola de reproducción"
            variant="outline"
          >
            <MaterialIcon name="queue_music" />
          </AudioPlayerButton>
        </DialogTrigger>
        <div aria-label="Select a track" data-slot="audio-queue">
          <DialogHeader className="sr-only">
            <DialogTitle>Cola de reproducción</DialogTitle>
            <DialogDescription>
              Selecciona una pista de la cola para reproducirla
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder={searchPlaceholder}
              value={searchQuery}
            />
            <CommandList>
              <AudioTrackList
                emptyDescription={emptyDescription}
                emptyLabel={emptyLabel}
                filterQuery={searchQuery}
                mode={isFiltered ? "static" : "sortable"}
                onTrackRemove={handleTrackRemove}
                onTrackSelect={handleTrackSelect}
              />
            </CommandList>
          </Command>
          <DialogFooter>
            <AudioPlayerButton className="w-full" onClick={handleClearQueue}>
              Limpiar cola
            </AudioPlayerButton>
          </DialogFooter>
        </div>
      </Dialog>
    )
  }
)

type AudioPlaybackSpeedProps = React.ComponentProps<typeof Button> & {
  speeds?: readonly { value: number; label: string }[]
}

function AudioPlaybackSpeed({
  className,
  size,
  variant = "outline",
  speeds = PLAYBACK_SPEEDS,
  ...props
}: AudioPlaybackSpeedProps) {
  const playbackRate = useAudioStore((state) => state.playbackRate)
  const setPlaybackRate = useAudioStore((state) => state.setPlaybackRate)
  const duration = useAudioStore((state) => state.duration)
  const { htmlAudio } = useAudio()
  const isLiveStream = htmlAudio.isLive(duration)

  const currentSpeed = speeds.find((s) => s.value === playbackRate) || speeds[2]
  const displayLabel = currentSpeed?.label

  const handleSpeedChange = React.useCallback(
    (value: string) => {
      if (isLiveStream) {
        return
      }
      const speed = Number.parseFloat(value)
      setPlaybackRate(speed)
    },
    [isLiveStream, setPlaybackRate]
  )

  const tooltipLabel = isLiveStream
    ? "No disponible para transmisiones en vivo"
    : "Velocidad de reproducción"

  const isIconSize = size === "icon"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AudioPlayerButton
          className={cn(className)}
          data-slot="audio-playback-speed-button"
          isDisabled={isLiveStream}
          size={size}
          tooltipLabel={tooltipLabel}
          variant={variant}
          {...props}
        >
          {!isIconSize && <MaterialIcon name="speed" />}
          <span className="font-mono text-xs">{displayLabel}</span>
        </AudioPlayerButton>
      </DropdownMenuTrigger>
      <div className={cn(className)} data-slot="audio-playback-speed-content">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Velocidad de reproducción</DropdownMenuLabel>
          <RadioGroup
            onChange={(value: string) => handleSpeedChange(value)}
            value={String(playbackRate)}
          >
            {speeds.map((speed) => (
              <RadioGroupItem key={speed.value} value={String(speed.value)}>
                {speed.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </DropdownMenuGroup>
      </div>
    </DropdownMenu>
  )
}

AudioPlayerPlay.displayName = "AudioPlayerPlay"
AudioPlayerRewind.displayName = "AudioPlayerRewind"
AudioPlayerFastForward.displayName = "AudioPlayerFastForward"
AudioPlayerSkipForward.displayName = "AudioPlayerSkipForward"
AudioPlayerSkipBack.displayName = "AudioPlayerSkipBack"
AudioQueue.displayName = "AudioQueue"

export {
  audioPlayerVariants,
  AudioProvider,
  AudioPlayer,
  AudioPlayerButton,
  AudioPlayerControlBar,
  AudioPlayerControlGroup,
  AudioPlayerTimeDisplay,
  AudioPlayerSeekBar,
  AudioPlayerVolume,
  AudioPlayerPlay,
  AudioPlayerRewind,
  AudioPlayerFastForward,
  AudioPlayerSkipForward,
  AudioPlayerSkipBack,
  AudioTrack,
  AudioTrackList,
  AudioQueuePreferences,
  AudioQueueRepeatMode,
  AudioQueueShuffle,
  AudioQueue,
  AudioPlaybackSpeed,
}
