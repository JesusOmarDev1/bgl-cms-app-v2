import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Spinner } from "@/components/ui/spinner"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("spinner.default")}
          description={t("spinner.default_hint")}
        >
          <Spinner />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("spinner.with_label")}
          description={t("spinner.with_label_hint")}
        >
          <div className="flex items-center gap-2">
            <Spinner />
            <span className="text-sm text-muted-foreground">
              {t("spinner.loading")}
            </span>
          </div>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
