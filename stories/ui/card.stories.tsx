import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("card.with_data")}
          description={t("card.with_data_hint")}
          stack
        >
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{t("card.title")}</CardTitle>
              <CardDescription>{t("card.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("card.body")}</p>
            </CardContent>
            <CardFooter>
              <Button>{t("card.action")}</Button>
            </CardFooter>
          </Card>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("card.empty")}
          description={t("card.empty_hint")}
          stack
        >
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{t("card.empty_title")}</CardTitle>
              <CardDescription>{t("card.empty_description")}</CardDescription>
            </CardHeader>
          </Card>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
