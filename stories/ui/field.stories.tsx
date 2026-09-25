import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Field",
  component: Field,
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("field.vertical")}
          description={t("field.vertical_hint")}
          stack
        >
          <FieldGroup className="max-w-md">
            <Field orientation="vertical">
              <FieldLabel htmlFor="story-field-email">
                {t("field.email_label")}
              </FieldLabel>
              <Input
                id="story-field-email"
                type="email"
                placeholder={t("field.email_placeholder")}
              />
              <FieldDescription>
                {t("field.email_description")}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("field.horizontal")}
          description={t("field.horizontal_hint")}
          stack
        >
          <FieldGroup className="max-w-md">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="story-field-name">
                {t("field.name_label")}
              </FieldLabel>
              <Input
                id="story-field-name"
                placeholder={t("field.name_placeholder")}
              />
            </Field>
          </FieldGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("field.invalid")}
          description={t("field.invalid_hint")}
          stack
        >
          <FieldGroup className="max-w-md">
            <Field data-invalid="true">
              <FieldLabel htmlFor="story-field-invalid">
                {t("field.email_label")}
              </FieldLabel>
              <Input
                id="story-field-invalid"
                type="email"
                defaultValue="no-valido"
                aria-invalid
                placeholder={t("field.email_placeholder")}
              />
              <FieldError>{t("field.error")}</FieldError>
            </Field>
          </FieldGroup>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
