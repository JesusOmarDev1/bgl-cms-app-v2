import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
  "red",
  "glass",
  "none",
] as const

const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "xl",
  "2xl",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
  "icon-xl",
] as const

const effects = ["default"] as const

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Botón",
    variant: "default",
    size: "default",
    effect: "default",
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
    effect: {
      control: "select",
      options: [...effects],
    },
  },
  parameters: {
    controls: {
      include: ["children", "variant", "size", "effect", "isDisabled"],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("button.sample")}
          description={t("button.sample_hint")}
        >
          <Button {...args}>{t("button.label")}</Button>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("button.variants")}
          description={t("button.variants_hint")}
        >
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("button.sizes")}
          description={t("button.sizes_hint")}
        >
          {sizes.map((size) => (
            <Button key={size} size={size}>
              {size.startsWith("icon") ? "★" : size}
            </Button>
          ))}
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("button.effect")}
          description={t("button.effect_hint")}
        >
          {effects.map((effect) => (
            <Button key={effect} effect={effect}>
              {effect}
            </Button>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
