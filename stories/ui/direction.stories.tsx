"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type * as React from "react"
import { useTranslations } from "next-intl"

import { DirectionProvider, useDirection } from "@/components/ui/direction"

import { StoryBlock } from "../../components/storybook/StoryBlock"

function DirectedLine({ children }: { children: React.ReactNode }) {
  const direction = useDirection()

  return <p dir={direction}>{children}</p>
}

const meta = {
  title: "UI/Direction",
  component: DirectionProvider,
} satisfies Meta<typeof DirectionProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("direction.ltr")}
          description={t("direction.ltr_hint")}
          stack
        >
          <DirectionProvider direction="ltr">
            <DirectedLine>{t("direction.sample")}</DirectedLine>
          </DirectionProvider>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("direction.rtl")}
          description={t("direction.rtl_hint")}
          stack
        >
          <DirectionProvider direction="rtl">
            <DirectedLine>{t("direction.sample")}</DirectedLine>
          </DirectionProvider>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
