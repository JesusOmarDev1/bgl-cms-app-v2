import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"
import reactDoctor from "eslint-plugin-react-doctor"

const leftoverIgnores = [
  "components/shared/AiCopyButton.tsx",
  "components/shared/DirectusImage.tsx",
  "components/shared/MaterialIcon.tsx",
  "components/shared/PreviewBanner.tsx",
  "components/shared/QrCode.tsx",
  "components/shared/Share.tsx",
  "components/shared/InfiniteScroll.tsx",
  "components/shared/PullToRefresh.tsx",
  "components/shared/SafeHtml.tsx",
  "components/shared/JsonViewer.tsx",
  "components/shared/Toc.tsx",
  "components/shared/StatusIndicator.tsx",
  "components/shared/ThemeToggle.tsx",
  "components/shared/PhoneInput.tsx",
  "components/shared/Typography.tsx",
  "components/shared/audio/**",
]

const firstPartyNested = [
  "app/**/*.{js,jsx,ts,tsx}",
  "components/shared/animation/**/*.{js,jsx,ts,tsx}",
  "components/shared/assets/**/*.{js,jsx,ts,tsx}",
  "components/shared/content/**/*.{js,jsx,ts,tsx}",
  "components/shared/debug/**/*.{js,jsx,ts,tsx}",
  "components/shared/forms/**/*.{js,jsx,ts,tsx}",
  "components/shared/spinners/**/*.{js,jsx,ts,tsx}",
  "components/shared/theme/**/*.{js,jsx,ts,tsx}",
  "components/shared/utility/**/*.{js,jsx,ts,tsx}",
  "components/shared/visual-editing/**/*.{js,jsx,ts,tsx}",
  "hooks/**/*.{js,jsx,ts,tsx}",
  "providers/**/*.{js,jsx,ts,tsx}",
  "lib/**/*.{js,jsx,ts,tsx}",
  "services/**/*.{js,jsx,ts,tsx}",
  "config/**/*.{js,jsx,ts,tsx}",
]

const scopeReactDoctor = (config) => ({
  ...config,
  files: firstPartyNested,
})

const reactDoctorOff = Object.fromEntries(
  Object.keys(reactDoctor.rules).map((name) => [`react-doctor/${name}`, "off"])
)

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  scopeReactDoctor(reactDoctor.configs.recommended),
  scopeReactDoctor(reactDoctor.configs.next),
  scopeReactDoctor(reactDoctor.configs["tanstack-query"]),
  {
    files: ["components/ui/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-doctor": reactDoctor,
    },
    rules: reactDoctorOff,
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".codegraph/**",
    ".cursor/**",
    ".vscode/**",
    ".github/**",
    ".ai/**",
    "tsconfig.tsbuildinfo",
    ".gga",
    ".env.example",
    ...leftoverIgnores,
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
])

export default eslintConfig
