"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { setAttr } from "@directus/visual-editing"
import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import { DirectusImage } from "@/components/shared/assets/img/DirectusImage"
import { Box } from "@/components/shared/content/Box"
import { BoxContainer } from "@/components/shared/content/BoxLayout"
import { MarqueeAppear } from "@/components/shared/content/MarqueeAppear"
import { SafeHtml } from "@/components/shared/content/SafeHtml"
import { Button } from "@/components/ui/button"
import type { HeroBlockQuery } from "@/services/domain/db/queries/blocks/hero-block/hero-block.fields"

export function HeroClient({ data }: { data: HeroBlockQuery }) {
  const slides: { id: number; src: string }[] = []
  for (const row of data.images ?? []) {
    const src = row.directus_files_id?.id
    if (!src) continue
    slides.push({ id: row.id, src })
  }

  const logos: { id: number; src: string; title: string }[] = []
  if (data.variant === "carousel_with_logos") {
    for (const row of data.brands ?? []) {
      const brand = row.brands_id
      const src = brand?.logo?.id
      if (!brand || !src) continue
      logos.push({ id: row.id, src, title: brand.title })
    }
  }

  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (data.variant !== "carousel" && data.variant !== "carousel_with_logos") {
      return
    }
    if (slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [data.variant, slides.length])

  const primary =
    data.primary_button && data.primary_url
      ? {
          label: data.primary_button,
          href: data.primary_url,
          icon: data.primary_icon,
        }
      : null
  const secondary =
    data.secondary_button && data.secondary_url
      ? {
          label: data.secondary_button,
          href: data.secondary_url,
          icon: data.secondary_icon ?? "",
        }
      : null
  const hasCopy = Boolean(data.title || data.excerpt || primary || secondary)
  const copy = hasCopy ? (
    <div className="flex max-w-3xl flex-col gap-4">
      {data.title ? (
        <h1 className="font-semibold tracking-tight">{data.title}</h1>
      ) : null}
      {data.excerpt ? (
        <SafeHtml content={data.excerpt} preset="compact" />
      ) : null}
      {primary || secondary ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {primary ? (
            <Link href={primary.href}>
              <Button size="lg" variant="red">
                <MaterialIcon name={primary.icon} size={20} />
                {primary.label}
              </Button>
            </Link>
          ) : null}
          {secondary ? (
            <Link href={secondary.href}>
              <Button size="lg" variant="glass">
                <MaterialIcon name={secondary.icon} size={20} />
                {secondary.label}
              </Button>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  ) : null
  const picture = data.image?.id ? (
    <DirectusImage
      alt={data.title || ""}
      className="w-full rounded-xl"
      sizing="contained"
      src={data.image.id}
      variant="hero"
    />
  ) : null
  const active = slides.length === 0 ? 0 : index % slides.length

  switch (data.variant) {
    case "simple":
      if (!hasCopy) return null
      return (
        <Box
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
          <BoxContainer>{copy}</BoxContainer>
        </Box>
      )
    case "background_img":
      if (!hasCopy && !data.image?.id) return null
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
          {data.image?.id ? (
            <DirectusImage
              alt=""
              className="absolute inset-0 size-full"
              sizing="fill"
              src={data.image.id}
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
              {copy}
            </Box>
          </BoxContainer>
        </Box>
      )
    case "right_to_img":
    case "left_to_img": {
      if (!hasCopy && !picture) return null
      const imageFirst = data.variant === "left_to_img"
      return (
        <Box
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
          <BoxContainer>
            <Box
              align="center"
              cols={{ base: 1, md: 2 }}
              display="grid"
              gap={3}
            >
              {imageFirst ? picture : null}
              {copy}
              {imageFirst ? null : picture}
            </Box>
          </BoxContainer>
        </Box>
      )
    }
    case "bottom_to_img":
      if (!hasCopy && !picture) return null
      return (
        <Box
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
          <BoxContainer>
            <Box display="flex" gap={3} orientation="vertical">
              {copy}
              {picture}
            </Box>
          </BoxContainer>
        </Box>
      )
    case "carousel":
    case "carousel_with_logos":
      if (!hasCopy && slides.length === 0 && logos.length === 0) return null
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
              {copy}
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
    default:
      return null
  }
}
