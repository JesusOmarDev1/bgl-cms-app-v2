import "@/app/globals.css"
import type { Preview } from "@storybook/nextjs-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { themes } from "storybook/theming"

let storyQueryClient: QueryClient | undefined

function getStoryQueryClient() {
  storyQueryClient ??= new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return storyQueryClient
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={getStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    themes: themes.dark,
  },
}

export default preview
