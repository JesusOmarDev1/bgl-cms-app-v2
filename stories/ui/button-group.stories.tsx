import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const orientations = ["horizontal", "vertical"] as const

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: [...orientations],
    },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

function GroupButtons() {
  const t = useTranslations("storybook")

  return (
    <>
      <Button variant="outline">{t("button_group.prev")}</Button>
      <Button variant="outline">{t("button_group.current")}</Button>
      <Button variant="outline">{t("button_group.next")}</Button>
    </>
  )
}

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("button_group.sample")}
          description={t("button_group.sample_hint")}
        >
          <ButtonGroup {...args}>
            <GroupButtons />
          </ButtonGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("button_group.horizontal")}
          description={t("button_group.horizontal_hint")}
        >
          <ButtonGroup orientation="horizontal">
            <GroupButtons />
          </ButtonGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("button_group.vertical")}
          description={t("button_group.vertical_hint")}
        >
          <ButtonGroup orientation="vertical">
            <GroupButtons />
          </ButtonGroup>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
