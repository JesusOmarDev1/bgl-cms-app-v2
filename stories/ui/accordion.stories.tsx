import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Accordion",
  component: Accordion,
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("accordion.closed")}
          description={t("accordion.closed_hint")}
          stack
        >
          <Accordion className="max-w-md">
            <AccordionItem id="preguntas-frecuentes">
              <AccordionTrigger>{t("accordion.q1")}</AccordionTrigger>
              <AccordionContent>{t("accordion.a1")}</AccordionContent>
            </AccordionItem>
            <AccordionItem id="soporte">
              <AccordionTrigger>{t("accordion.q2")}</AccordionTrigger>
              <AccordionContent>{t("accordion.a2")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("accordion.expanded")}
          description={t("accordion.expanded_hint")}
          stack
        >
          <Accordion
            className="max-w-md"
            defaultExpandedKeys={["preguntas-frecuentes"]}
          >
            <AccordionItem id="preguntas-frecuentes">
              <AccordionTrigger>{t("accordion.q1")}</AccordionTrigger>
              <AccordionContent>{t("accordion.a1")}</AccordionContent>
            </AccordionItem>
            <AccordionItem id="soporte">
              <AccordionTrigger>{t("accordion.q2")}</AccordionTrigger>
              <AccordionContent>{t("accordion.a2")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
