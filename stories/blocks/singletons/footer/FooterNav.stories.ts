import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { FooterNavClient } from "@/components/blocks/singletons/footer/FooterNavClient"
import type { FooterQueryResult } from "@/services/domain/db/queries/singletons/footer/footer"

const mockFooter = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  logo_dark: null,
  phones: [],
  emails: [],
  social_links: [],
  url_links: [],
  date_created: "datetime",
  date_updated: "datetime",
} satisfies FooterQueryResult

const meta = {
  title: "Blocks/Singletons/Footer/FooterNav",
  component: FooterNavClient,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  args: {
    data: mockFooter,
  },
} satisfies Meta<typeof FooterNavClient>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
