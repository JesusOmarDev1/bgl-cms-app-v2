import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Skeleton } from "@/components/ui/skeleton"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("skeleton.line")}
          description={t("skeleton.line_hint")}
        >
          <Skeleton className="h-4 w-48" />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("skeleton.avatar")}
          description={t("skeleton.avatar_hint")}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("skeleton.card")}
          description={t("skeleton.card_hint")}
          stack
        >
          <Skeleton className="h-32 w-full max-w-sm rounded-xl" />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
