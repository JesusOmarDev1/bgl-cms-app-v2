import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Bubble, BubbleContent } from "@/components/ui/bubble"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const

const meta = {
  title: "UI/Bubble",
  component: Bubble,
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
  },
} satisfies Meta<typeof Bubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("bubble.sample")}
          description={t("bubble.sample_hint")}
          stack
        >
          <Bubble {...args}>
            <BubbleContent>{t("bubble.hello")}</BubbleContent>
          </Bubble>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("bubble.variants")}
          description={t("bubble.variants_hint")}
          stack
        >
          {variants.map((variant) => (
            <Bubble key={variant} variant={variant}>
              <BubbleContent>{variant}</BubbleContent>
            </Bubble>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
