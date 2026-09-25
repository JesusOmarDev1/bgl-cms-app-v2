import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("avatar.with_image")}
          description={t("avatar.with_image_hint")}
        >
          <Avatar>
            <AvatarImage src="/static/logo.png" alt={t("avatar.alt")} />
          </Avatar>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("avatar.fallback")}
          description={t("avatar.fallback_hint")}
        >
          <Avatar>
            <AvatarFallback>MG</AvatarFallback>
          </Avatar>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
