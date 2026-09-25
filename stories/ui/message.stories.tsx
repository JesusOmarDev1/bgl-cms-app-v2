import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Message",
  component: Message,
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("message.with_data")}
          description={t("message.with_data_hint")}
          stack
        >
          <MessageGroup className="max-w-md">
            <Message>
              <MessageAvatar>
                <Avatar size="sm">
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>{t("message.from")}</MessageHeader>
                <Bubble variant="muted">
                  <BubbleContent>{t("message.body_in")}</BubbleContent>
                </Bubble>
                <MessageFooter>{t("message.time_in")}</MessageFooter>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageContent>
                <Bubble>
                  <BubbleContent>{t("message.body_out")}</BubbleContent>
                </Bubble>
                <MessageFooter>{t("message.time_out")}</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("message.single")}
          description={t("message.single_hint")}
          stack
        >
          <MessageGroup className="max-w-md">
            <Message>
              <MessageAvatar>
                <Avatar size="sm">
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>{t("message.from")}</MessageHeader>
                <Bubble variant="muted">
                  <BubbleContent>{t("message.body_in")}</BubbleContent>
                </Bubble>
                <MessageFooter>{t("message.time_in")}</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
