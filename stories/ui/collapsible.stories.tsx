import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("collapsible.closed")}
          description={t("collapsible.closed_hint")}
          stack
        >
          <Collapsible className="max-w-md">
            <CollapsibleTrigger className="text-sm font-medium">
              {t("collapsible.trigger")}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              {t("collapsible.content")}
            </CollapsibleContent>
          </Collapsible>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("collapsible.open")}
          description={t("collapsible.open_hint")}
          stack
        >
          <Collapsible className="max-w-md" defaultExpanded>
            <CollapsibleTrigger className="text-sm font-medium">
              {t("collapsible.trigger")}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              {t("collapsible.content")}
            </CollapsibleContent>
          </Collapsible>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
