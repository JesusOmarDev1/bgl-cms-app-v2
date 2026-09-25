import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Calendar, RangeCalendar } from "@/components/ui/calendar"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Calendar",
  component: Calendar,
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("calendar.simple")}
          description={t("calendar.simple_hint")}
          stack
        >
          <Calendar aria-label={t("calendar.aria_simple")} />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("calendar.range")}
          description={t("calendar.range_hint")}
          stack
        >
          <RangeCalendar aria-label={t("calendar.aria_range")} />
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
