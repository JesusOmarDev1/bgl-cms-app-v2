import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("sheet.closed")}
          description={t("sheet.closed_hint")}
        >
          <SheetTrigger>
            <Button>{t("sheet.trigger")}</Button>
            <Sheet>
              <SheetHeader>
                <SheetTitle>{t("sheet.title")}</SheetTitle>
                <SheetDescription>{t("sheet.description")}</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose>{t("sheet.close")}</SheetClose>
              </SheetFooter>
            </Sheet>
          </SheetTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
