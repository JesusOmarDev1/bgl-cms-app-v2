import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Kbd, KbdGroup } from "@/components/ui/kbd"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Kbd",
  component: Kbd,
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("kbd.single")}
          description={t("kbd.single_hint")}
        >
          <Kbd>{t("kbd.key")}</Kbd>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("kbd.combo")}
          description={t("kbd.combo_hint")}
        >
          <KbdGroup>
            <Kbd>{t("kbd.ctrl")}</Kbd>
            <Kbd>{t("kbd.key")}</Kbd>
          </KbdGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("kbd.in_sentence")}
          description={t("kbd.in_sentence_hint")}
        >
          <p className="text-sm">
            {t("kbd.sentence_before")}{" "}
            <KbdGroup>
              <Kbd>{t("kbd.ctrl")}</Kbd>
              <Kbd>{t("kbd.key")}</Kbd>
            </KbdGroup>{" "}
            {t("kbd.sentence_after")}
          </p>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
