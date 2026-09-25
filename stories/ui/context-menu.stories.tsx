import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/ContextMenu",
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("context_menu.closed")}
          description={t("context_menu.closed_hint")}
        >
          <ContextMenuTrigger>
            <Button variant="outline">{t("context_menu.trigger")}</Button>
            <ContextMenu>
              <ContextMenuItem id="copy">
                {t("context_menu.copy")}
              </ContextMenuItem>
              <ContextMenuItem id="paste">
                {t("context_menu.paste")}
              </ContextMenuItem>
              <ContextMenuItem id="delete" variant="destructive">
                {t("context_menu.delete")}
              </ContextMenuItem>
            </ContextMenu>
          </ContextMenuTrigger>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
