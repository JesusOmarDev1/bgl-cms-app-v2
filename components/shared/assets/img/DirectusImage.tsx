"use client"

import { useState, type CSSProperties, type Ref } from "react"
import Image, { type ImageProps } from "next/image"

import { getAssetUrl } from "@/lib/directus/asset-url"
import { UUID_REGEX } from "@/lib/validations/uuid"
import { imageLoader } from "@/lib/directus/image-loader"
import {
  VARIANT_CONFIG,
  type DirectusImageQuality,
  type DirectusImageSizing,
  type DirectusImageVariant,
} from "@/lib/directus/image-variants"
import { cn } from "cn"

export type { DirectusImageQuality, DirectusImageSizing, DirectusImageVariant }

function resolveDirectusSrc(
  src: string | null | undefined,
  fit: "cover" | "contain"
): string | null {
  if (!src) return null
  const trimmed = src.trim()
  if (!trimmed) return null

  if (UUID_REGEX.test(trimmed)) {
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

function pairCssDimensions(style: CSSProperties): CSSProperties {
  const hasWidth = style.width !== undefined
  const hasHeight = style.height !== undefined
  if (hasWidth === hasHeight) return style
  return hasWidth ? { ...style, height: "auto" } : { ...style, width: "auto" }
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

function DirectusImagePlaceholder({
  rest,
  ref,
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
<<<<<<< HEAD
  rest: Omit<
    ImageProps,
    | "src"
    | "ref"
    | "alt"
    | "width"
    | "height"
    | "className"
    | "style"
    | "loader"
    | "placeholder"
    | "fill"
    | "sizes"
    | "quality"
    | "onError"
  >
=======
  rest: Omit<ImageProps, "src" | "ref" | "alt" | "width" | "height" | "className" | "style" | "loader" | "placeholder" | "fill" | "sizes" | "quality" | "onError">
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  ref?: Ref<HTMLImageElement>
  src: string
  alt: string
  width: number
  height: number
  className: string
  style: CSSProperties
}) {
  return (
    <Image
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      unoptimized
      width={width}
      height={height}
      className={className}
      style={style}
      data-placeholder="true"
    />
  )
}

function DirectusImageOutput({
  rest,
  ref,
  src,
  alt,
  sizing,
  width,
  height,
  loader,
  placeholder,
  sizes,
  quality,
  className,
  style,
  onError,
}: {
<<<<<<< HEAD
  rest: Omit<
    ImageProps,
    | "src"
    | "ref"
    | "alt"
    | "width"
    | "height"
    | "className"
    | "style"
    | "loader"
    | "placeholder"
    | "fill"
    | "sizes"
    | "quality"
    | "onError"
  >
=======
  rest: Omit<ImageProps, "src" | "ref" | "alt" | "width" | "height" | "className" | "style" | "loader" | "placeholder" | "fill" | "sizes" | "quality" | "onError">
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  ref?: Ref<HTMLImageElement>
  src: string
  alt: string
  sizing: DirectusImageSizing
  width: number
  height: number
  loader: ImageProps["loader"]
  placeholder: ImageProps["placeholder"]
  sizes: string | undefined
  quality: number
  className: string
  style: CSSProperties
  onError: ImageProps["onError"]
}) {
  return sizing === "fill" ? (
<<<<<<< HEAD
    <Image
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      fill
      loader={loader}
      placeholder={placeholder}
      sizes={sizes}
      quality={quality}
      className={className}
      style={style}
      onError={onError}
    />
  ) : (
    <Image
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loader={loader}
      placeholder={placeholder}
      {...(sizes !== undefined ? { sizes } : {})}
      quality={quality}
      className={className}
      style={style}
      onError={onError}
    />
=======
    <Image {...rest} ref={ref} src={src} alt={alt} fill loader={loader} placeholder={placeholder} sizes={sizes} quality={quality} className={className} style={style} onError={onError} />
  ) : (
    <Image {...rest} ref={ref} src={src} alt={alt} width={width} height={height} loader={loader} placeholder={placeholder} {...(sizes !== undefined ? { sizes } : {})} quality={quality} className={className} style={style} onError={onError} />
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  )
}

function resolveImagePresentation({
  src,
  variant,
  sizing,
  width,
  height,
  sizes,
  quality,
  className,
  imgClassName,
  style,
  failedSrc,
}: {
  src: string | null | undefined
  variant: DirectusImageVariant
  sizing: DirectusImageSizing
  width: number | undefined
  height: number | undefined
  sizes: string | undefined
  quality: DirectusImageQuality | undefined
  className: string | undefined
  imgClassName: string | undefined
  style: CSSProperties | undefined
  failedSrc: string | null
}) {
  const config = VARIANT_CONFIG[variant]
  const resolvedSrc = resolveDirectusSrc(src, config.fit)
  const showPlaceholder = resolvedSrc === null || failedSrc === resolvedSrc
  const resolvedWidth = width ?? config.defaultSize.w
  const resolvedHeight = height ?? config.defaultSize.h
<<<<<<< HEAD
  const resolvedSizes =
    sizes ?? (sizing === "auto" && !config.fluid ? undefined : config.sizes)
=======
  const resolvedSizes = sizes ?? (sizing === "auto" && !config.fluid ? undefined : config.sizes)
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  const resolvedQuality = quality ?? config.quality
  const wrapperClassName = cn(
    "overflow-hidden",
    sizing === "fill" && "relative",
    sizing === "auto" && (config.fluid ? "w-full" : "shrink-0"),
    className
  )
  const imageClassName = cn(
    sizing === "contained" && "h-auto w-full",
    sizing === "auto" && "max-w-none",
    imgClassName
  )
  const imageStyle: CSSProperties = {
    objectFit: config.objectFit,
    ...(sizing === "auto" && {
      aspectRatio: `${resolvedWidth} / ${resolvedHeight}`,
      width: config.fluid ? "100%" : resolvedWidth,
      maxWidth: config.fluid ? resolvedWidth : undefined,
      height: "auto",
    }),
<<<<<<< HEAD
    ...(sizing === "fill" &&
      showPlaceholder && { width: "100%", height: "100%" }),
=======
    ...(sizing === "fill" && showPlaceholder && { width: "100%", height: "100%" }),
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
    ...style,
  }
  return {
    config,
    resolvedSrc,
    showPlaceholder,
    resolvedWidth,
    resolvedHeight,
    resolvedSizes,
    resolvedQuality,
    wrapperClassName,
    imageClassName,
    imageStyle,
<<<<<<< HEAD
    nonFillStyle:
      sizing === "fill" ? imageStyle : pairCssDimensions(imageStyle),
=======
    nonFillStyle: sizing === "fill" ? imageStyle : pairCssDimensions(imageStyle),
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
  }
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
  const image = resolveImagePresentation({
    src,
    variant,
    sizing,
    width,
    height,
    sizes,
    quality,
    className,
    imgClassName,
    style,
    failedSrc,
  })

  if (image.showPlaceholder) {
    return (
      <div className={image.wrapperClassName}>
        <DirectusImagePlaceholder
          rest={rest}
          ref={ref}
          src={image.config.placeholder}
          alt={alt}
          width={image.resolvedWidth}
          height={image.resolvedHeight}
          className={image.imageClassName}
          style={image.nonFillStyle}
        />
      </div>
    )
  }

  const handleError: ImageProps["onError"] = (event) => {
    setFailedSrc(image.resolvedSrc)
    onError?.(event)
  }

  return (
    <div className={image.wrapperClassName}>
      <DirectusImageOutput
        rest={rest}
        ref={ref}
        src={image.resolvedSrc!}
        alt={alt}
        sizing={sizing}
        width={image.resolvedWidth}
        height={image.resolvedHeight}
        loader={imageLoader}
        placeholder={image.config.placeholder}
<<<<<<< HEAD
        sizes={
          sizing === "fill"
            ? (image.resolvedSizes ?? image.config.sizes)
            : image.resolvedSizes
        }
=======
        sizes={sizing === "fill" ? image.resolvedSizes ?? image.config.sizes : image.resolvedSizes}
>>>>>>> dc117f02e8dc3847ce9f7c2e18c73989ee8cd902
        quality={image.resolvedQuality}
        className={image.imageClassName}
        style={sizing === "fill" ? image.imageStyle : image.nonFillStyle}
        onError={handleError}
      />
    </div>
  )
}
