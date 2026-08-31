"use client"

import { useTranslations } from "next-intl"

import {
  JsonViewer,
  type JsonViewerProps,
} from "@/components/shared/debug/JsonViewer"

export function DebugJsonViewer({
  data,
  title,
  rootName,
  defaultExpanded,
  colorTheme,
  className,
  ...props
}: Omit<JsonViewerProps, "labels">) {
  const t = useTranslations("debug.jsonViewer")
  const labels = {
    search: t("search"),
    expandAll: t("expandAll"),
    collapseAll: t("collapseAll"),
    copy: t("copy"),
    item: t("item"),
    items: t("items"),
    key: t("key"),
    keys: t("keys"),
    closeSearch: t("closeSearch"),
    clearSearch: t("clearSearch"),
    searchPlaceholder: t("searchPlaceholder"),
    searchInputLabel: t("searchInputLabel"),
    copyPath: t("copyPath"),
    expand: t("expand"),
    collapse: t("collapse"),
  }

  return (
    <JsonViewer
      {...props}
      className={className}
      colorTheme={colorTheme}
      data={data}
      defaultExpanded={defaultExpanded}
      labels={labels}
      rootName={rootName}
      title={title}
    />
  )
}
