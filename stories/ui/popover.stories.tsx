import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("popover.closed")}
          description={t("popover.closed_hint")}
        >
          <PopoverTrigger>
            <Button>{t("popover.trigger")}</Button>
            <Popover>
              <PopoverHeader>
                <PopoverTitle>{t("popover.title")}</PopoverTitle>
                <PopoverDescription>
                  {t("popover.description")}
                </PopoverDescription>
              </PopoverHeader>
            </Popover>
          </PopoverTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
