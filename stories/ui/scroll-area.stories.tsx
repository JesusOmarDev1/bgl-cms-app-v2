import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { ScrollArea } from "@/components/ui/scroll-area"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("scroll_area.with_content")}
          description={t("scroll_area.with_content_hint")}
          stack
        >
          <ScrollArea className="h-48 w-64 rounded-lg border p-4">
            <div className="space-y-2">
              {Array.from({ length: 20 }, (_, index) => (
                <p key={index} className="text-sm">
                  {t("scroll_area.item")} {index + 1}
                </p>
              ))}
            </div>
          </ScrollArea>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("scroll_area.short")}
          description={t("scroll_area.short_hint")}
          stack
        >
          <ScrollArea className="h-48 w-64 rounded-lg border p-4">
            <div className="space-y-2">
              <p className="text-sm">{t("scroll_area.item")} 1</p>
              <p className="text-sm">{t("scroll_area.item")} 2</p>
              <p className="text-sm">{t("scroll_area.item")} 3</p>
            </div>
          </ScrollArea>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
