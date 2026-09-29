import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const variants = ["default", "outline", "muted"] as const
const sizes = ["default", "sm", "xs"] as const

const meta = {
  title: "UI/Item",
  component: Item,
  args: {
    variant: "outline",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
    size: {
      control: "select",
      options: [...sizes],
    },
  },
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

function SampleItem({
  variant,
  size,
  title,
  description,
}: {
  variant?: (typeof variants)[number]
  size?: (typeof sizes)[number]
  title: string
  description: string
}) {
  return (
    <Item variant={variant} size={size} className="max-w-md">
      <ItemMedia variant="icon">
        <MaterialIcon name="description" size={16} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

export const Default: Story = {
  render: (args) => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("item.default")}
          description={t("item.default_hint")}
          stack
        >
          <SampleItem
            variant={args.variant ?? "outline"}
            size={args.size ?? "default"}
            title={t("item.title")}
            description={t("item.description")}
          />
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("item.variants")}
          description={t("item.variants_hint")}
          stack
        >
          {variants.map((variant) => (
            <SampleItem
              key={variant}
              variant={variant}
              title={t("item.title")}
              description={t("item.description")}
            />
          ))}
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
