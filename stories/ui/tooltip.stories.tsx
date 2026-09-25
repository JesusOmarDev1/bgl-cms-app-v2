import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("tooltip.closed")}
          description={t("tooltip.closed_hint")}
        >
          <TooltipTrigger>
            <Button>{t("tooltip.trigger")}</Button>
            <Tooltip>{t("tooltip.content")}</Tooltip>
          </TooltipTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
