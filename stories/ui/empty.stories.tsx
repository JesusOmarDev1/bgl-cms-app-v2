import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { InboxIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Empty",
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("empty.filled")}
          description={t("empty.filled_hint")}
          stack
        >
          <Empty className="max-w-md border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>{t("empty.action")}</Button>
            </EmptyContent>
          </Empty>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("empty.icon_only")}
          description={t("empty.icon_only_hint")}
          stack
        >
          <Empty className="max-w-md border">
            <EmptyHeader>
              <EmptyMedia variant="default">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>{t("empty.action")}</Button>
            </EmptyContent>
          </Empty>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
