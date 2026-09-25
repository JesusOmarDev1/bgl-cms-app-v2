import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("separator.horizontal")}
          description={t("separator.horizontal_hint")}
          stack
        >
          <div className="w-64 space-y-2">
            <div className="h-4 rounded-sm bg-muted/40" />
            <Separator />
            <div className="h-4 rounded-sm bg-muted/40" />
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("separator.vertical")}
          description={t("separator.vertical_hint")}
        >
          <div className="flex h-16 items-center gap-4">
            <div className="h-full w-8 rounded-sm bg-muted/40" />
            <Separator orientation="vertical" />
            <div className="h-full w-8 rounded-sm bg-muted/40" />
          </div>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
