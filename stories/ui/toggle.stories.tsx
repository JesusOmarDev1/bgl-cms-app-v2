import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Toggle } from "@/components/ui/toggle"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = ["default", "outline"] as const
const sizes = ["default", "sm", "lg"] as const

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  args: {
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
    size: {
      control: "select",
      options: [...sizes],
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("toggle.sample")}
          description={t("toggle.sample_hint")}
        >
          <Toggle {...args}>{t("toggle.label")}</Toggle>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("toggle.variants")}
          description={t("toggle.variants_hint")}
        >
          {variants.map((variant) => (
            <Toggle key={variant} variant={variant}>
              {variant}
            </Toggle>
          ))}
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("toggle.sizes")}
          description={t("toggle.sizes_hint")}
        >
          {sizes.map((size) => (
            <Toggle key={size} size={size}>
              {size}
            </Toggle>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
