"use client"

import { useState, useTransition } from "react"
import { useQueryStates } from "nuqs"
import { useTranslations } from "next-intl"
import type { Key } from "react-aria-components"

import { Box } from "@/components/shared/content/Box"
import { ButtonWithIcon } from "@/components/shared/content/ButtonWithIcon"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { debugSearchParams } from "@/app/debug/search-params"
import {
  DEBUG_KINDS,
  getDebugResourcesByKind,
  isDebugKind,
  type DebugKind,
} from "@/services/domain/db/debug/catalog"

export function DebugToolbar() {
  const t = useTranslations("debug")
  const [isPending, startTransition] = useTransition()
  const [committed, setDebugParams] = useQueryStates(debugSearchParams)
  const [kind, setKind] = useState<DebugKind | null>(committed.kind)
  const [resource, setResource] = useState<string | null>(committed.resource)
  const resourceItems =
    kind === null
      ? []
      : getDebugResourcesByKind(kind).map((item) => ({
          id: item.key,
          label: item.label,
        }))
  const canExtract =
    kind !== null &&
    resource !== null &&
    resourceItems.some((item) => item.id === resource)

  function handleKindChange(key: Key | null) {
    if (typeof key !== "string" || !isDebugKind(key)) {
      setKind(null)
      setResource(null)
      return
    }

    setKind(key)
    setResource(null)
  }

  function handleResourceChange(key: Key | null) {
    if (typeof key !== "string") {
      setResource(null)
      return
    }

    setResource(key)
  }

  function handleExtract() {
    if (kind === null || resource === null || !canExtract) {
      return
    }

    void setDebugParams({ kind, resource }, { shallow: false, startTransition })
  }

  return (
    <Box display="flex" orientation="vertical" gap={3}>
      <h1 className="text-lg font-semibold">{t("title")}</h1>
      <Box
        display="flex"
        orientation="horizontal"
        align="center"
        gap={2}
        wrap="wrap"
      >
        <Select
          aria-label={t("kindLabel")}
          placeholder={t("kindPlaceholder")}
          selectedKey={kind}
          onSelectionChange={handleKindChange}
        >
          <SelectTrigger className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEBUG_KINDS.map((debugKind) => (
              <SelectItem key={debugKind} id={debugKind}>
                {t(`kind.${debugKind}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Combobox
          aria-label={t("resourceLabel")}
          allowsEmptyCollection
          isDisabled={kind === null}
          selectedKey={resource}
          onSelectionChange={handleResourceChange}
        >
          <ComboboxInput
            className="min-w-56"
            disabled={kind === null}
            placeholder={t("resourcePlaceholder")}
          />
          <ComboboxContent>
            <ComboboxEmpty>{t("resourceEmpty")}</ComboboxEmpty>
            <ComboboxList items={resourceItems}>
              {(item) => (
                <ComboboxItem id={item.id} textValue={item.label}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <ButtonWithIcon
          icon="output"
          isDisabled={!canExtract}
          isPending={isPending}
          onPress={handleExtract}
        >
          {t("extract")}
        </ButtonWithIcon>
      </Box>
    </Box>
  )
}
