import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("alert_dialog.closed")}
          description={t("alert_dialog.closed_hint")}
        >
          <AlertDialogTrigger>
            <Button>{t("alert_dialog.trigger")}</Button>
            <AlertDialog>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("alert_dialog.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("alert_dialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("alert_dialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction>
                  {t("alert_dialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialog>
          </AlertDialogTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
