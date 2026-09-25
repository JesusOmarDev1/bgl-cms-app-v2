import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FileTextIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Attachment",
  component: Attachment,
} satisfies Meta<typeof Attachment>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("attachment.with_file")}
          description={t("attachment.with_file_hint")}
        >
          <Attachment>
            <AttachmentMedia variant="icon">
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{t("attachment.title")}</AttachmentTitle>
              <AttachmentDescription>
                {t("attachment.description")}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("attachment.empty")}
          description={t("attachment.empty_hint")}
        >
          <Attachment state="idle">
            <AttachmentMedia variant="icon">
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{t("attachment.empty_title")}</AttachmentTitle>
              <AttachmentDescription>
                {t("attachment.empty_description")}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
