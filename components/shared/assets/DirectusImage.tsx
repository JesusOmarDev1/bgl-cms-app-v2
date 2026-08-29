"use client"

import { useState, type CSSProperties, type Ref } from "react"
import Image, { type ImageProps } from "next/image"

import { getAssetUrl } from "@/lib/directus/asset-url"
import { directusImageLoader } from "@/lib/directus/directus-image-loader"
import {
  VARIANT_CONFIG,
  type DirectusImageQuality,
  type DirectusImageSizing,
  type DirectusImageVariant,
} from "@/lib/directus/image-variants"
import { cn } from "@/lib/utils"

export type {
  DirectusImageQuality,
  DirectusImageSizing,
  DirectusImageVariant,
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function resolveDirectusSrc(
  src: string | null | undefined,
  fit: "cover" | "contain"
): string | null {
  if (!src) return null
  const trimmed = src.trim()
  if (!trimmed) return null

  if (UUID_RE.test(trimmed)) {
    return getAssetUrl(trimmed, { fit })
  }

  const protocol = trimmed.slice(0, 8).toLowerCase()
  if (!protocol.startsWith("https://") && !protocol.startsWith("http://")) {
    return null
  }

  try {
    const url = new URL(trimmed)
    if (!url.searchParams.has("fit")) {
      url.searchParams.set("fit", fit)
    }
    return url.href
  } catch {
    return null
  }
}

type DirectusImageProps = Omit<
  ImageProps,
  | "src"
  | "loader"
  | "placeholder"
  | "fill"
  | "width"
  | "height"
  | "sizes"
  | "quality"
  | "style"
  | "onError"
  | "alt"
  | "priority"
> & {
  src?: string | null
  alt?: string
  variant?: DirectusImageVariant
  sizing?: DirectusImageSizing
  width?: number
  height?: number
  sizes?: string
  quality?: DirectusImageQuality
  className?: string
  imgClassName?: string
  style?: CSSProperties
  onError?: ImageProps["onError"]
  ref?: Ref<HTMLImageElement>
}

export function DirectusImage({
  src,
  variant = "original",
  sizing = "auto",
  alt = "",
  className,
  imgClassName,
  width,
  height,
  sizes,
  quality,
  style,
  onError,
  ref,
  ...rest
}: DirectusImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const config = VARIANT_CONFIG[variant]
  const resolvedSrc = resolveDirectusSrc(src, config.fit)
  const showPlaceholder = resolvedSrc === null || failedSrc === resolvedSrc

  const resolvedWidth = width ?? config.defaultSize.w
  const resolvedHeight = height ?? config.defaultSize.h
  const resolvedSizes = sizes ?? config.sizes
  const resolvedQuality = quality ?? config.quality

  const wrapperClassName = cn(
    "overflow-hidden",
    sizing === "fill" && "relative",
    className
  )

  const imageClassName = cn(
    sizing === "contained" && "h-auto w-full",
    imgClassName
  )

  const imageStyle: CSSProperties = {
    objectFit: config.objectFit,
    ...(sizing === "auto" && {
      aspectRatio: String(config.ratio),
      width: "100%",
    }),
    ...(sizing === "fill" &&
      showPlaceholder && {
        width: "100%",
        height: "100%",
      }),
    ...style,
  }

  if (showPlaceholder) {
    return (
      <div className={wrapperClassName}>
        <Image
          {...rest}
          ref={ref}
          src={config.placeholder}
          alt={alt}
          unoptimized
          width={resolvedWidth}
          height={resolvedHeight}
          className={imageClassName}
          style={imageStyle}
          data-placeholder="true"
        />
      </div>
    )
  }

  const handleError: ImageProps["onError"] = (event) => {
    setFailedSrc(resolvedSrc)
    onError?.(event)
  }

  if (sizing === "fill") {
    return (
      <div className={wrapperClassName}>
        <Image
          {...rest}
          ref={ref}
          src={resolvedSrc}
          alt={alt}
          fill
          loader={directusImageLoader}
          placeholder={config.placeholder}
          sizes={resolvedSizes}
          quality={resolvedQuality}
          className={imageClassName}
          style={imageStyle}
          onError={handleError}
        />
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <Image
        {...rest}
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={resolvedWidth}
        height={resolvedHeight}
        loader={directusImageLoader}
        placeholder={config.placeholder}
        sizes={resolvedSizes}
        quality={resolvedQuality}
        className={imageClassName}
        style={imageStyle}
        onError={handleError}
      />
    </div>
  )
}
