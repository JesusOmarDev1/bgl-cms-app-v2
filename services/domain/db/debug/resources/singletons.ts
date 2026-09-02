import type { DebugResourceDefinition } from "@/services/domain/db/debug/resources/types"

export const DEBUG_SINGLETON_RESOURCES = [
  {
    kind: "singleton",
    key: "site_settings",
    label: "site_settings",
    labelKey: "resources.site_settings",
  },
  {
    kind: "singleton",
    key: "header",
    label: "header",
    labelKey: "resources.header",
  },
  {
    kind: "singleton",
    key: "footer",
    label: "footer",
    labelKey: "resources.footer",
  },
  {
    kind: "singleton",
    key: "whatsapp_button",
    label: "whatsapp_button",
    labelKey: "resources.whatsapp_button",
  },
  {
    kind: "singleton",
    key: "services_button",
    label: "services_button",
    labelKey: "resources.services_button",
  },
] as const satisfies readonly DebugResourceDefinition[]
