import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("radio_group.default")}
          description={t("radio_group.default_hint")}
          stack
        >
          <RadioGroup
            {...args}
            defaultValue="uno"
            aria-label={t("radio_group.default")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="uno" id="story-radio-uno" />
              <Label htmlFor="story-radio-uno">
                {t("radio_group.option1")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dos" id="story-radio-dos" />
              <Label htmlFor="story-radio-dos">
                {t("radio_group.option2")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="tres" id="story-radio-tres" />
              <Label htmlFor="story-radio-tres">
                {t("radio_group.option3")}
              </Label>
            </div>
          </RadioGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("radio_group.disabled")}
          description={t("radio_group.disabled_hint")}
          stack
        >
          <RadioGroup
            isDisabled
            defaultValue="uno"
            aria-label={t("radio_group.disabled")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="uno" id="story-radio-disabled-uno" />
              <Label htmlFor="story-radio-disabled-uno">
                {t("radio_group.option1")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dos" id="story-radio-disabled-dos" />
              <Label htmlFor="story-radio-disabled-dos">
                {t("radio_group.option2")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="tres" id="story-radio-disabled-tres" />
              <Label htmlFor="story-radio-disabled-tres">
                {t("radio_group.option3")}
              </Label>
            </div>
          </RadioGroup>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
