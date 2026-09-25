import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Combobox",
  component: Combobox,
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("combobox.closed")}
          description={t("combobox.closed_hint")}
        >
          <Combobox aria-label={t("combobox.aria")} className="w-48">
            <ComboboxInput placeholder={t("combobox.placeholder")} />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem id="a" textValue={t("combobox.one")}>
                  {t("combobox.one")}
                </ComboboxItem>
                <ComboboxItem id="b" textValue={t("combobox.two")}>
                  {t("combobox.two")}
                </ComboboxItem>
                <ComboboxItem id="c" textValue={t("combobox.three")}>
                  {t("combobox.three")}
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("combobox.disabled")}
          description={t("combobox.disabled_hint")}
        >
          <Combobox isDisabled aria-label={t("combobox.aria")} className="w-48">
            <ComboboxInput placeholder={t("combobox.placeholder")} />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem id="a-disabled" textValue={t("combobox.one")}>
                  {t("combobox.one")}
                </ComboboxItem>
                <ComboboxItem id="b-disabled" textValue={t("combobox.two")}>
                  {t("combobox.two")}
                </ComboboxItem>
                <ComboboxItem id="c-disabled" textValue={t("combobox.three")}>
                  {t("combobox.three")}
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
