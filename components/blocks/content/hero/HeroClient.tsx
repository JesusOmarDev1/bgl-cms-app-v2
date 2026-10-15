"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { MarqueeAppear } from "@/components/shared/content/MarqueeAppear"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import {
  directusFileId,
  expandedJunctions,
  isExpanded,
} from "@/components/blocks/directus-relation"
import type { HeroBlock } from "@/types/blocks/content/hero-block"
import type { HeroBlockBrandsJunction } from "@/types/collections/junctions/hero-block-brands"
import type { HeroBlockFilesJunction } from "@/types/collections/junctions/hero-block-files"

type HeroLink = {
  label: string
  href: string
  icon: string
}

function heroLinks(data: HeroBlock): {
  primary: HeroLink | null
  secondary: HeroLink | null
} {
  return {
    primary:
      data.primary_button && data.primary_url
        ? {
            label: data.primary_button,
            href: data.primary_url,
            icon: data.primary_icon,
          }
        : null,
    secondary:
      data.secondary_button && data.secondary_url
        ? {
            label: data.secondary_button,
            href: data.secondary_url,
            icon: data.secondary_icon ?? "",
          }
        : null,
  }
}

function hasHeroCopy(data: HeroBlock) {
  const links = heroLinks(data)
  return Boolean(data.title || data.excerpt || links.primary || links.secondary)
}

function HeroCopy({ data }: { data: HeroBlock }) {
  const links = heroLinks(data)
  if (!hasHeroCopy(data)) return null

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {data.title ? (
        <h1 className="font-semibold tracking-tight">{data.title}</h1>
      ) : null}
      {data.excerpt ? (
        <SafeHtml content={data.excerpt} preset="compact" />
      ) : null}
      {links.primary || links.secondary ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {links.primary ? (
            <Link href={links.primary.href}>
              <Button size="lg" variant="red">
                <MaterialIcon name={links.primary.icon} size={20} />
                {links.primary.label}
              </Button>
            </Link>
          ) : null}
          {links.secondary ? (
            <Link href={links.secondary.href}>
              <Button size="lg" variant="glass">
                <MaterialIcon name={links.secondary.icon} size={20} />
                {links.secondary.label}
              </Button>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function HeroPicture({ file, alt }: { file: HeroBlock["image"]; alt: string }) {
  const src = directusFileId(file)
  if (!src) return null
  return (
    <DirectusImage
      alt={alt}
      className="w-full rounded-xl"
      sizing="contained"
      src={src}
      variant="hero"
    />
  )
}

function heroSlides(images: HeroBlock["images"]) {
  const slides: { id: number; src: string }[] = []
  for (const row of expandedJunctions<HeroBlockFilesJunction>(images)) {
    const src = directusFileId(row.directus_files_id)
    if (!src) continue
    slides.push({ id: row.id, src })
  }
  return slides
}

function heroLogos(brands: HeroBlock["brands"]) {
  const logos: { id: number; src: string; title: string }[] = []
  for (const row of expandedJunctions<HeroBlockBrandsJunction>(brands)) {
    if (!isExpanded(row.brands_id)) continue
    const src = directusFileId(row.brands_id.logo)
    if (!src) continue
    logos.push({ id: row.id, src, title: row.brands_id.title })
  }
  return logos
}

function HeroFrame({
  data,
  children,
  className,
}: {
  data: HeroBlock
  children: ReactNode
  className?: string
}) {
  return (
    <Box
      className={className}
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields:
          "title,excerpt,variant,image,images,brands,primary_button,primary_url,primary_icon,secondary_button,secondary_url,secondary_icon",
        mode: "popover",
      })}
      display="flex"
      gap={3}
      orientation="vertical"
      paddingBottom={3}
      paddingTop={3}
      render={(props) => <section {...props} />}
    >
      {children}
    </Box>
  )
}

function HeroSimple({ data }: { data: HeroBlock }) {
  if (!hasHeroCopy(data)) return null
  return (
    <HeroFrame data={data}>
      <BoxContainer>
        <HeroCopy data={data} />
      </BoxContainer>
    </HeroFrame>
  )
}

function HeroBackground({ data }: { data: HeroBlock }) {
  const src = directusFileId(data.image)
  if (!hasHeroCopy(data) && !src) return null
  return (
    <Box
      className="relative min-h-[28rem] overflow-hidden"
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields: "title,excerpt,variant,image,primary_button,primary_url",
        mode: "popover",
      })}
      render={(props) => <section {...props} />}
    >
      {src ? (
        <DirectusImage
          alt=""
          className="absolute inset-0 size-full"
          sizing="fill"
          src={src}
          variant="hero"
        />
      ) : null}
      <div className="absolute inset-0 bg-background/60" />
      <BoxContainer
        align="end"
        className="relative z-10 min-h-[28rem]"
        display="flex"
      >
        <Box paddingBottom={3} paddingTop={3}>
          <HeroCopy data={data} />
        </Box>
      </BoxContainer>
    </Box>
  )
}

function HeroSplit({
  data,
  imageFirst,
}: {
  data: HeroBlock
  imageFirst: boolean
}) {
  const src = directusFileId(data.image)
  if (!hasHeroCopy(data) && !src) return null
  const image = <HeroPicture alt={data.title || ""} file={data.image} />
  return (
    <HeroFrame data={data}>
      <BoxContainer>
        <Box align="center" cols={{ base: 1, md: 2 }} display="grid" gap={3}>
          {imageFirst ? image : null}
          <HeroCopy data={data} />
          {imageFirst ? null : image}
        </Box>
      </BoxContainer>
    </HeroFrame>
  )
}

function HeroBottom({ data }: { data: HeroBlock }) {
  const src = directusFileId(data.image)
  if (!hasHeroCopy(data) && !src) return null
  return (
    <HeroFrame data={data}>
      <BoxContainer>
        <Box display="flex" gap={3} orientation="vertical">
          <HeroCopy data={data} />
          <HeroPicture alt={data.title || ""} file={data.image} />
        </Box>
      </BoxContainer>
    </HeroFrame>
  )
}

function HeroCarousel({
  data,
  withLogos = false,
}: {
  data: HeroBlock
  withLogos?: boolean
}) {
  const slides = heroSlides(data.images)
  const logos = withLogos ? heroLogos(data.brands) : []
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [slides.length])
  const active = slides.length === 0 ? 0 : index % slides.length
  if (!hasHeroCopy(data) && slides.length === 0 && logos.length === 0) {
    return null
  }

  return (
    <section
      className="relative h-dvh w-full overflow-hidden"
      data-directus={setAttr({
        collection: "hero_block",
        item: data.id,
        fields:
          "title,excerpt,variant,image,images,brands,primary_button,primary_url,primary_icon,secondary_button,secondary_url,secondary_icon",
        mode: "popover",
      })}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== active}
          className={`absolute inset-0 transition-opacity duration-700 ${
            slideIndex === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <DirectusImage
            alt=""
            className="size-full"
            sizing="fill"
            src={slide.src}
            variant="hero"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 flex h-full w-full min-w-0 flex-col pt-24">
        <BoxContainer display="flex" gap={2} orientation="vertical">
          <HeroCopy data={data} />
          {logos.length > 0 ? (
            <MarqueeAppear className="w-full min-w-0">
              {logos.map((logo) => (
                <DirectusImage
                  key={logo.id}
                  alt={logo.title}
                  src={logo.src}
                  title={logo.title}
                  variant="logo"
                />
              ))}
            </MarqueeAppear>
          ) : null}
        </BoxContainer>
      </div>
    </section>
  )
}

export function HeroClient({ data }: { data: HeroBlock }) {
  switch (data.variant) {
    case "simple":
      return <HeroSimple data={data} />
    case "background_img":
      return <HeroBackground data={data} />
    case "right_to_img":
      return <HeroSplit data={data} imageFirst={false} />
    case "left_to_img":
      return <HeroSplit data={data} imageFirst />
    case "bottom_to_img":
      return <HeroBottom data={data} />
    case "carousel":
      return <HeroCarousel data={data} />
    case "carousel_with_logos":
      return <HeroCarousel data={data} withLogos />
    default:
      return null
  }
}
