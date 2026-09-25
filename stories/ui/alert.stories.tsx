import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = ["default", "destructive"] as const

const meta = {
  title: "UI/Alert",
  component: Alert,
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("alert.sample")}
          description={t("alert.sample_hint")}
          stack
        >
          <Alert {...args}>
            <AlertTitle>{t("alert.title")}</AlertTitle>
            <AlertDescription>{t("alert.description")}</AlertDescription>
          </Alert>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("alert.variants")}
          description={t("alert.variants_hint")}
          stack
        >
          {variants.map((variant) => (
            <Alert key={variant} variant={variant}>
              <AlertTitle>{variant}</AlertTitle>
              <AlertDescription>{t("alert.description")}</AlertDescription>
            </Alert>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
