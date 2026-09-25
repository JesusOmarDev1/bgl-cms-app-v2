---
version: alpha
name: BGL Básculas
description: Dark industrial storefront. Near-black canvas, Geist, one red accent.
colors:
  background: "oklch(0.145 0 0)"
  surface: "oklch(0.205 0 0)"
  secondary: "oklch(0.269 0 0)"
  primary: "oklch(0.922 0 0)"
  on-primary: "oklch(0.205 0 0)"
  text: "oklch(0.985 0 0)"
  text-muted: "oklch(0.708 0 0)"
  border: "oklch(1 0 0 / 10%)"
  destructive: "oklch(0.704 0.191 22.216)"
  brand: "#e7000b"
typography:
  display:
    fontFamily: Geist
    fontSize: 1.875rem
    fontWeight: 600
    lineHeight: 1.3
  heading:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.75
  caption:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.5
  code:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 0.525rem
  md: 0.7rem
  lg: 0.875rem
  xl: 1.225rem
  4xl: 2.275rem
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 10px
  button-brand:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 10px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: 16px
  input:
    backgroundColor: transparent
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 10px
---

# BGL Básculas

## Overview

BGL Básculas is a dark industrial storefront. The canvas is near-black, type is Geist, and the only chromatic brand color is red `#e7000b`. Product photography and CMS content carry the page. UI chrome stays quiet. The locale is `es-MX`.

The browser paints `app/theme.css`. This file describes that shipped dark theme. A color change edits `app/theme.css` and the matching YAML token in the same change. `#e7000b` also lives on the `red` variant in `components/ui/button.tsx` and on `::selection` in `app/theme.css`.

## Colors

Tokens below are the `.dark` block in `app/theme.css`. `app/layout.tsx` forces that theme (`forcedTheme="dark"`).

- **Background:** near-black page canvas (`bg-background`).
- **Surface:** card and popover fill (`bg-card`). Cards paint it at 30% opacity.
- **Secondary:** quiet fills for secondary buttons and hover wells (`bg-secondary`).
- **Primary:** light neutral for the default button (`bg-primary`) with dark **on-primary** text.
- **Text / text-muted:** foreground and metadata (`text-foreground`, `text-muted-foreground`).
- **Border:** 10% white hairline (`border-border`).
- **Destructive:** error and destructive actions.
- **Brand (`#e7000b`):** the `red` button variant and text selection. Nowhere else.

## Typography

Geist is the sans and the heading face. Geist Mono is code. Both load from `lib/fonts/geist.tsx` as `--font-geist` and `--font-geist-mono`.

- **Display:** page and card titles. `.typeset` headings use weight 600.
- **Heading:** section headings (typeset `h2`, `1.25em`).
- **Body:** `.typeset-article` — `1.0625rem`, line-height `1.75`.
- **Caption:** compact UI, badges, and button labels (`text-sm`, weight 500). Typeset `h6` is uppercase with `letter-spacing: 0.08em`.
- **Code:** Geist Mono. Typeset `pre` is `0.875em` of the prose size.

## Layout

Pages sit in `BoxContainer` (`max-w-7xl`). Long copy sits in `BoxProse` (`max-w-prose`). A sidebar layout is `lg:grid-cols-[minmax(0,1fr)_18rem]` with the sidebar sticky at `top-24`.

Spacing follows the Tailwind steps `Box` already allows: 4, 8, 16, 24, 32, 48, and 64px (`spacing.xs` through `spacing.3xl`).

## Elevation & Depth

Depth is a hairline and blur. Cards use `ring-1 ring-foreground/10`, `bg-card/30`, and `backdrop-blur-2xl`. The header starts transparent and, after scroll, uses `border-border`, `bg-background/30`, and `backdrop-blur-sm`.

## Shapes

Base radius is `0.875rem` (`--radius` in `app/theme.css`). `sm` and `md` are `0.6` and `0.8` of that base. Buttons and inputs use `rounded-lg` (`rounded.lg`). Cards use `rounded-xl`. Badges use `rounded-4xl` (`rounded.4xl`).

## Components

Use `components/ui`. The tokens above cover the three atoms agents reach for first.

- **button-primary** — `Button` variant `default`.
- **button-brand** — `Button` variant `red`.
- Also shipped on `buttonVariants`: `outline`, `secondary`, `ghost`, `destructive`, `link`, `glass`, `none`. Sizes run from `xs` through `2xl`, plus icon sizes.
- **card** — `Card`. Vertical rhythm is `--card-spacing` (`spacing.md`). Header and content use `px-8` (`spacing.xl`).
- **input** — `Input`. Border is `border-input`. Focus ring is `ring-ring/50`.

Icons go through `MaterialIcon` (Material Symbols Rounded).

## Do's and Don'ts

- Do use the Tailwind token classes: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`.
- Do keep `#e7000b` on the `red` button and on `::selection`.
- Do put Spanish UI copy in the next-intl catalogs.
- Don't add a new hex color.
- Don't add a light theme.
- Don't add a second button, card, or input component.
