import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  args: {
    defaultSelected: false,
    isDisabled: false,
  },
  parameters: {
    controls: {
      include: ["isDisabled", "defaultSelected"],
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("checkbox.unchecked")}
          description={t("checkbox.unchecked_hint")}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="story-checkbox-unchecked" {...args} />
            <Label htmlFor="story-checkbox-unchecked">
              {t("checkbox.terms")}
            </Label>
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("checkbox.checked")}
          description={t("checkbox.checked_hint")}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="story-checkbox-checked" defaultSelected />
            <Label htmlFor="story-checkbox-checked">
              {t("checkbox.terms")}
            </Label>
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("checkbox.disabled")}
          description={t("checkbox.disabled_hint")}
        >
          <div className="flex items-center gap-2">
            <Checkbox id="story-checkbox-disabled" isDisabled />
            <Label htmlFor="story-checkbox-disabled">
              {t("checkbox.terms")}
            </Label>
          </div>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
