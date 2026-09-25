import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = ["default", "separator", "border"] as const

const meta = {
  title: "UI/Marker",
  component: Marker,
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
  },
} satisfies Meta<typeof Marker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("marker.default")}
          description={t("marker.default_hint")}
          stack
        >
          <Marker {...args}>
            <MarkerIcon>•</MarkerIcon>
            <MarkerContent>{t("marker.label")}</MarkerContent>
          </Marker>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("marker.variants")}
          description={t("marker.variants_hint")}
          stack
        >
          {variants.map((variant) => (
            <Marker key={variant} variant={variant}>
              <MarkerIcon>•</MarkerIcon>
              <MarkerContent>{variant}</MarkerContent>
            </Marker>
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
