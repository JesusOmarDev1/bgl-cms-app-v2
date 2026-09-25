import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "Escribe aquí…",
    "aria-label": "Campo de texto",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("input.default")}
          description={t("input.default_hint")}
        >
          <Input
            {...args}
            placeholder={t("input.placeholder")}
            aria-label={t("input.aria")}
          />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("input.with_value")}
          description={t("input.with_value_hint")}
        >
          <Input
            defaultValue={t("input.sample_value")}
            aria-label={t("input.aria")}
          />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("input.disabled")}
          description={t("input.disabled_hint")}
        >
          <Input
            disabled
            placeholder={t("input.placeholder")}
            aria-label={t("input.aria")}
          />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("input.invalid")}
          description={t("input.invalid_hint")}
        >
          <Input
            defaultValue={t("input.sample_value")}
            aria-invalid
            aria-label={t("input.aria")}
          />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
