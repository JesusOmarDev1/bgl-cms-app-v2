import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Drawer",
  component: Drawer,
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("drawer.closed")}
          description={t("drawer.closed_hint")}
        >
          <Drawer>
            <DrawerTrigger render={<Button variant="outline" />}>
              {t("drawer.trigger")}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("drawer.title")}</DrawerTitle>
                <DrawerDescription>{t("drawer.description")}</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose render={<Button variant="outline" />}>
                  {t("drawer.close")}
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("drawer.trigger_label")}
          description={t("drawer.trigger_hint")}
        >
          <Drawer>
            <DrawerTrigger render={<Button variant="outline" />}>
              {t("drawer.trigger")}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("drawer.title")}</DrawerTitle>
                <DrawerDescription>{t("drawer.description")}</DrawerDescription>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
