import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("dialog.closed")}
          description={t("dialog.closed_hint")}
        >
          <DialogTrigger>
            <Button>{t("dialog.trigger")}</Button>
            <Dialog>
              <DialogHeader>
                <DialogTitle>{t("dialog.title")}</DialogTitle>
                <DialogDescription>{t("dialog.description")}</DialogDescription>
              </DialogHeader>
            </Dialog>
          </DialogTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
