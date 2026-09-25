import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Label",
  component: Label,
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("label.default")}
          description={t("label.default_hint")}
          stack
        >
          <div className="flex max-w-md flex-col gap-2">
            <Label htmlFor="story-label-default">{t("label.text")}</Label>
            <Input
              id="story-label-default"
              placeholder={t("label.placeholder")}
            />
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("label.disabled")}
          description={t("label.disabled_hint")}
          stack
        >
          <div className="flex max-w-md flex-col gap-2">
            <Label htmlFor="story-label-disabled">{t("label.text")}</Label>
            <Input
              id="story-label-disabled"
              disabled
              placeholder={t("label.placeholder")}
            />
          </div>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
