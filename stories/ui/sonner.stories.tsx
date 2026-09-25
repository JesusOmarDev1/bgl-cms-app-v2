import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Sonner",
  component: Toaster,
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("sonner.default")}
          description={t("sonner.default_hint")}
        >
          <Button onPress={() => toast(t("sonner.message"))}>
            {t("sonner.trigger")}
          </Button>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("sonner.success")}
          description={t("sonner.success_hint")}
        >
          <Button onPress={() => toast.success(t("sonner.success_message"))}>
            {t("sonner.trigger_success")}
          </Button>
        </StoryBlock.Section>
        <Toaster />
      </StoryBlock>
    )
  },
}
