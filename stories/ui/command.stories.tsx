import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Command",
  component: Command,
  parameters: {
    controls: {
      exclude: ["children", "className"],
    },
  },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("command.with_data")}
          description={t("command.with_data_hint")}
          stack
        >
          <Command className="max-w-sm rounded-lg border">
            <CommandInput placeholder={t("command.placeholder")} />
            <CommandList>
              <CommandEmpty>{t("command.no_results")}</CommandEmpty>
              <CommandGroup heading={t("command.group_actions")}>
                <CommandItem id="action" textValue={t("command.action")}>
                  {t("command.action")}
                  <CommandShortcut>{t("command.shortcut")}</CommandShortcut>
                </CommandItem>
                <CommandItem
                  id="action-other"
                  textValue={t("command.action_other")}
                >
                  {t("command.action_other")}
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading={t("command.group_nav")}>
                <CommandItem id="nav-home" textValue={t("command.nav_home")}>
                  {t("command.nav_home")}
                </CommandItem>
                <CommandItem
                  id="nav-settings"
                  textValue={t("command.nav_settings")}
                >
                  {t("command.nav_settings")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("command.empty")}
          description={t("command.empty_hint")}
          stack
        >
          <Command className="max-w-sm rounded-lg border">
            <CommandInput placeholder={t("command.placeholder")} />
            <CommandList>
              <CommandEmpty>{t("command.no_results")}</CommandEmpty>
            </CommandList>
          </Command>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
