"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type SchemeKey = "system" | "light" | "dark"
const SCHEMES: readonly SchemeKey[] = ["system", "light", "dark"]

const subscribeNever = () => () => {}

// Each preview keeps its own palette, independent of the active theme.
const LIGHT = {
  bg: "oklch(1 0 0)",
  panel: "oklch(0.985 0 0)",
  surface: "oklch(1 0 0)",
  strong: "oklch(0.35 0 0)",
  muted: "oklch(0.82 0 0)",
  stroke: "oklch(0.922 0 0)",
}
const DARK = {
  bg: "oklch(0.145 0 0)",
  panel: "oklch(0.205 0 0)",
  surface: "oklch(0.205 0 0)",
  strong: "oklch(0.87 0 0)",
  muted: "oklch(0.39 0 0)",
  stroke: "oklch(1 0 0 / 12%)",
}

function PreviewScene({ colors }: { colors: typeof LIGHT }) {
  return (
    <g>
      <rect width="120" height="64" fill={colors.bg} />
      <rect width="24" height="64" fill={colors.panel} />
      <rect x="5" y="8" width="12" height="3" rx="1.5" fill={colors.strong} />
      <rect x="5" y="18" width="14" height="2" rx="1" fill={colors.muted} />
      <rect x="5" y="25" width="11" height="2" rx="1" fill={colors.muted} />
      <rect x="5" y="32" width="13" height="2" rx="1" fill={colors.muted} />
      <rect x="30" y="8" width="30" height="3" rx="1.5" fill={colors.strong} />
      <rect x="30" y="15" width="48" height="2" rx="1" fill={colors.muted} />
      <rect
        x="30"
        y="25"
        width="39"
        height="30"
        rx="3"
        fill={colors.surface}
        stroke={colors.stroke}
      />
      <rect
        x="75"
        y="25"
        width="36"
        height="13"
        rx="3"
        fill={colors.surface}
        stroke={colors.stroke}
      />
      <rect
        x="75"
        y="43"
        width="36"
        height="12"
        rx="3"
        fill={colors.surface}
        stroke={colors.stroke}
      />
      <path
        d="M36 47l8-8 7 4 11-11"
        fill="none"
        stroke={colors.strong}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="80" y="30" width="19" height="2" rx="1" fill={colors.muted} />
      <rect x="80" y="48" width="25" height="2" rx="1" fill={colors.muted} />
    </g>
  )
}

function SchemePreview({ scheme }: { scheme: SchemeKey }) {
  return (
    <svg
      viewBox="0 0 120 64"
      preserveAspectRatio="none"
      className="h-20 w-full rounded-lg border border-border/60"
      aria-hidden="true"
    >
      {scheme === "system" ? (
        <>
          <defs>
            <clipPath id="scheme-preview-left">
              <rect width="60" height="64" />
            </clipPath>
            <clipPath id="scheme-preview-right">
              <rect x="60" width="60" height="64" />
            </clipPath>
          </defs>
          <g clipPath="url(#scheme-preview-left)">
            <PreviewScene colors={LIGHT} />
          </g>
          <g clipPath="url(#scheme-preview-right)">
            <PreviewScene colors={DARK} />
          </g>
        </>
      ) : (
        <PreviewScene colors={scheme === "light" ? LIGHT : DARK} />
      )}
    </svg>
  )
}

const SCHEME_CARD_CLASS =
  "h-auto! aspect-auto! w-full flex-col! items-stretch gap-2 rounded-xl border border-border bg-card/60 p-2 text-center transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-foreground/30 " +
  "[&_[data-slot=radio-group-indicator]]:hidden " +
  "data-selected:bg-card! data-selected:text-foreground! data-selected:border-foreground/60! data-selected:ring-1 data-selected:ring-foreground/25! dark:data-selected:bg-card!"

export function ThemeSchemePicker() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("theme")

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
  // next-themes resolves the stored theme after hydration; until then no card
  // is marked selected to avoid a wrong highlight on the server markup.
  const value =
    mounted && theme && (SCHEMES as readonly string[]).includes(theme)
      ? (theme as SchemeKey)
      : undefined

  return (
    <RadioGroup
      value={value}
      onChange={(next) => setTheme(next)}
      className="grid-cols-1 sm:grid-cols-3"
      aria-label={t("scheme")}
    >
      {SCHEMES.map((scheme) => (
        <RadioGroupItem
          key={scheme}
          value={scheme}
          className={SCHEME_CARD_CLASS}
        >
          <SchemePreview scheme={scheme} />
          <span className="text-sm font-medium">{t(scheme)}</span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  )
}
