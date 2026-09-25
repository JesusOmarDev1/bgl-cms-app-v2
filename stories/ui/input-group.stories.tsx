import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("input_group.empty")}
          description={t("input_group.empty_hint")}
        >
          <InputGroup className="max-w-md">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder={t("input_group.placeholder")} />
          </InputGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("input_group.with_value")}
          description={t("input_group.with_value_hint")}
        >
          <InputGroup className="max-w-md">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              defaultValue={t("input_group.sample_value")}
              placeholder={t("input_group.placeholder")}
            />
          </InputGroup>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
