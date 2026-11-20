import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"

import { playwright } from "@vitest/browser-playwright"

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: { alias: { "@": dirname } },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: [
            "lib/**/*.test.ts",
            "services/**/*.test.ts",
            "app/(auth)/(dashboard)/dashboard/ordenes/page.test.ts",
            "components/collections/catalog/**/*.test.ts",
            "components/shared/settings/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        optimizeDeps: { include: ["react/jsx-dev-runtime"] },
        test: {
          name: "media",
          include: [
            "components/shared/assets/audio/Transport.test.tsx",
            "components/shared/assets/audio/Fader.test.tsx",
            "hooks/useAudioProvider.test.tsx",
            "hooks/useVideoPlayback.test.tsx",
            "components/shared/utility/CookieConsentAnalytics.test.tsx",
            "components/shared/forms/DateRangePicker.test.tsx",
            "components/shared/settings/ProfileForm.test.tsx",
            "components/blocks/metrology/orders/OrdersClient.test.tsx",
            "components/blocks/metrology/orders/OrdersTableView.test.tsx",
          ],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
})
