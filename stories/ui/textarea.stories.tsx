import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Textarea } from "@/components/ui/textarea"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("textarea.default")}
          description={t("textarea.default_hint")}
        >
          <Textarea
            {...args}
            placeholder={t("textarea.placeholder")}
            aria-label={t("textarea.aria")}
          />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("textarea.with_value")}
          description={t("textarea.with_value_hint")}
        >
          <Textarea
            defaultValue={t("textarea.sample_value")}
            aria-label={t("textarea.aria")}
          />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
