"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/MessageScroller",
  component: MessageScroller,
} satisfies Meta<typeof MessageScroller>

export default meta
type Story = StoryObj<typeof meta>

const itemClassName =
  "[content-visibility:visible] [contain-intrinsic-size:auto]"

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    const bubbles = [
      { id: "mensaje-1", text: t("message_scroller.m1"), outgoing: false },
      { id: "mensaje-2", text: t("message_scroller.m2"), outgoing: true },
      { id: "mensaje-3", text: t("message_scroller.m3"), outgoing: false },
      { id: "mensaje-4", text: t("message_scroller.m4"), outgoing: true },
      { id: "mensaje-5", text: t("message_scroller.m5"), outgoing: false },
      { id: "mensaje-6", text: t("message_scroller.m6"), outgoing: true },
      { id: "mensaje-7", text: t("message_scroller.m7"), outgoing: false },
      { id: "mensaje-8", text: t("message_scroller.m8"), outgoing: true },
    ] as const

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("message_scroller.with_data")}
          description={t("message_scroller.with_data_hint")}
          stack
        >
          <MessageScrollerProvider defaultScrollPosition="end">
            <MessageScroller className="h-64 w-full max-w-md rounded-lg border border-border">
              <MessageScrollerViewport aria-label={t("message_scroller.aria")}>
                <MessageScrollerContent>
                  {bubbles.map((bubble, index) => (
                    <MessageScrollerItem
                      key={bubble.id}
                      messageId={bubble.id}
                      scrollAnchor={index === bubbles.length - 1}
                      className={
                        bubble.outgoing
                          ? `${itemClassName} ms-auto flex justify-end`
                          : `${itemClassName} flex justify-start`
                      }
                    >
                      <p
                        className={
                          bubble.outgoing
                            ? "rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                            : "rounded-lg bg-muted px-3 py-2 text-sm"
                        }
                      >
                        {bubble.text}
                      </p>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
