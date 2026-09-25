import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Slider } from "@/components/ui/slider"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Slider",
  component: Slider,
  args: {
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("slider.default")}
          description={t("slider.default_hint")}
        >
          <Slider {...args} aria-label={t("slider.aria")} className="w-64" />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("slider.disabled")}
          description={t("slider.disabled_hint")}
        >
          <Slider
            {...args}
            isDisabled
            aria-label={t("slider.aria")}
            className="w-64"
          />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
