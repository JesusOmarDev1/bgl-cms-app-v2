import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("tabs.default")}
          description={t("tabs.default_hint")}
          stack
        >
          <Tabs defaultSelectedKey="tab1" className="max-w-md">
            <TabsList>
              <TabsTrigger id="tab1">{t("tabs.tab1")}</TabsTrigger>
              <TabsTrigger id="tab2">{t("tabs.tab2")}</TabsTrigger>
              <TabsTrigger id="tab3">{t("tabs.tab3")}</TabsTrigger>
            </TabsList>
            <TabsContent id="tab1">{t("tabs.panel1")}</TabsContent>
            <TabsContent id="tab2">{t("tabs.panel2")}</TabsContent>
            <TabsContent id="tab3">{t("tabs.panel3")}</TabsContent>
          </Tabs>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("tabs.disabled")}
          description={t("tabs.disabled_hint")}
          stack
        >
          <Tabs defaultSelectedKey="tab1" className="max-w-md">
            <TabsList>
              <TabsTrigger id="tab1">{t("tabs.tab1")}</TabsTrigger>
              <TabsTrigger id="tab2" isDisabled>
                {t("tabs.tab2")}
              </TabsTrigger>
              <TabsTrigger id="tab3">{t("tabs.tab3")}</TabsTrigger>
            </TabsList>
            <TabsContent id="tab1">{t("tabs.panel1")}</TabsContent>
            <TabsContent id="tab2">{t("tabs.panel2")}</TabsContent>
            <TabsContent id="tab3">{t("tabs.panel3")}</TabsContent>
          </Tabs>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
