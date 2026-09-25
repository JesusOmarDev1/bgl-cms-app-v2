import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("dropdown_menu.closed")}
          description={t("dropdown_menu.closed_hint")}
        >
          <DropdownMenuTrigger>
            <Button>{t("dropdown_menu.trigger")}</Button>
            <DropdownMenu>
              <DropdownMenuItem id="option1">
                {t("dropdown_menu.option1")}
              </DropdownMenuItem>
              <DropdownMenuItem id="option2">
                {t("dropdown_menu.option2")}
              </DropdownMenuItem>
              <DropdownMenuItem id="option3">
                {t("dropdown_menu.option3")}
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("dropdown_menu.disabled")}
          description={t("dropdown_menu.disabled_hint")}
        >
          <DropdownMenuTrigger>
            <Button isDisabled>{t("dropdown_menu.trigger")}</Button>
            <DropdownMenu>
              <DropdownMenuItem id="option1-disabled">
                {t("dropdown_menu.option1")}
              </DropdownMenuItem>
              <DropdownMenuItem id="option2-disabled">
                {t("dropdown_menu.option2")}
              </DropdownMenuItem>
              <DropdownMenuItem id="option3-disabled">
                {t("dropdown_menu.option3")}
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
