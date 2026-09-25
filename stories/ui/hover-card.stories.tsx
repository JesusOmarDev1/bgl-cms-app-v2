import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("hover_card.closed")}
          description={t("hover_card.closed_hint")}
        >
          <HoverCardTrigger>
            <Button>{t("hover_card.trigger")}</Button>
            <HoverCard>
              <p className="text-sm">{t("hover_card.content")}</p>
            </HoverCard>
          </HoverCardTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
