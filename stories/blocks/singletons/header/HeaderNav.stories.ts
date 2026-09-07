import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { HeaderNavClient } from "@/components/blocks/singletons/header/HeaderNavClient"
import type { HeaderQueryResult } from "@/services/domain/db/queries/singletons/header/header"

const mockHeader = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  primary_button: "Contacto",
  primary_url: "/contacto",
  primary_icon: "mail",
  secondary_button: "Cotizar",
  secondary_url: "/cotizar",
  secondary_icon: "request_quote",
  logo_dark: null,
  url_links: [],
  social_links: [],
  date_created: "datetime",
  date_updated: "datetime",
} satisfies HeaderQueryResult

const meta = {
  title: "Blocks/Singletons/Header/HeaderNav",
  component: HeaderNavClient,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  args: {
    header: mockHeader,
  },
} satisfies Meta<typeof HeaderNavClient>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
