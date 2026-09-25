import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Switch } from "@/components/ui/switch"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("switch.on")}
          description={t("switch.on_hint")}
        >
          <Switch defaultSelected aria-label={t("switch.aria")} />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("switch.off")}
          description={t("switch.off_hint")}
        >
          <Switch defaultSelected={false} aria-label={t("switch.aria")} />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
