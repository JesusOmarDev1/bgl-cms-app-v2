import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "Etiqueta",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("badge.sample")}
          description={t("badge.sample_hint")}
        >
          <Badge {...args}>{t("badge.label")}</Badge>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("badge.variants")}
          description={t("badge.variants_hint")}
        >
          {variants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
