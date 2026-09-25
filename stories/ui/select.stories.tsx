import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Select",
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("select.closed")}
          description={t("select.closed_hint")}
        >
          <Select
            placeholder={t("select.placeholder")}
            aria-label={t("select.aria")}
            className="w-48"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="a" textValue={t("select.one")}>
                {t("select.one")}
              </SelectItem>
              <SelectItem id="b" textValue={t("select.two")}>
                {t("select.two")}
              </SelectItem>
              <SelectItem id="c" textValue={t("select.three")}>
                {t("select.three")}
              </SelectItem>
            </SelectContent>
          </Select>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("select.disabled")}
          description={t("select.disabled_hint")}
        >
          <Select
            isDisabled
            placeholder={t("select.placeholder")}
            aria-label={t("select.aria")}
            className="w-48"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="a" textValue={t("select.one")}>
                {t("select.one")}
              </SelectItem>
              <SelectItem id="b" textValue={t("select.two")}>
                {t("select.two")}
              </SelectItem>
              <SelectItem id="c" textValue={t("select.three")}>
                {t("select.three")}
              </SelectItem>
            </SelectContent>
          </Select>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
