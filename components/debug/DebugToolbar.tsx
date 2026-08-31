"use client"

import { useState, useTransition } from "react"
import { useQueryStates } from "nuqs"
import { useTranslations } from "next-intl"
import type { Key } from "react-aria-components"

import { Box } from "@/components/shared/content/Box"
import { ButtonWithIcon } from "@/components/shared/content/ButtonWithIcon"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { debugSearchParams } from "@/app/debug/search-params"
import {
  DEBUG_KINDS,
  getDebugResourcesByKind,
  isDebugKind,
  type DebugKind,
} from "@/services/domain/db/debug/catalog"
import { cn } from "@/lib/utils"

export function DebugToolbar() {
  const t = useTranslations("debug")
  const [isPending, startTransition] = useTransition()
  const [committed, setDebugParams] = useQueryStates(debugSearchParams)
  const [kind, setKind] = useState<DebugKind | null>(committed.kind)
  const [resource, setResource] = useState<string | null>(committed.resource)
  const [prevCommittedKind, setPrevCommittedKind] = useState(committed.kind)
  const [prevCommittedResource, setPrevCommittedResource] = useState(
    committed.resource
  )

  if (
    committed.kind !== prevCommittedKind ||
    committed.resource !== prevCommittedResource
  ) {
    setPrevCommittedKind(committed.kind)
    setPrevCommittedResource(committed.resource)
    setKind(committed.kind)
    setResource(committed.resource)
  }

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
  const isComboboxDisabled = kind === null

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
    <Box
      className="top-0 z-10 rounded-xl border border-border/60 bg-card shadow-sm"
      display="flex"
      orientation="vertical"
      padding={2}
      gap={0.75}
    >
      <Box display="flex" orientation="vertical" gap={0.25}>
        <h1 className="text-3xl font-bold text-balance">{t("title")}</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("subtitle")}
        </p>
      </Box>
      <FieldGroup className="flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
        <Field className="w-full sm:w-auto">
          <FieldLabel>{t("kindLabel")}</FieldLabel>
          <ButtonGroup aria-label={t("kindLabel")}>
            {DEBUG_KINDS.map((debugKind) => {
              const isSelected = kind === debugKind

              return (
                <Button
                  key={debugKind}
                  aria-pressed={isSelected}
                  className="h-10 w-1/2 min-w-24"
                  onPress={() => handleKindChange(debugKind)}
                  size="xl"
                  variant={isSelected ? "default" : "outline"}
                >
                  {t(`kind.${debugKind}`)}
                </Button>
              )
            })}
          </ButtonGroup>
        </Field>
        <Field className="w-full min-w-0 flex-1 sm:min-w-56">
          <FieldLabel>{t("resourceLabel")}</FieldLabel>
          <Combobox
            aria-label={t("resourceLabel")}
            allowsEmptyCollection
            isDisabled={isComboboxDisabled}
            selectedKey={resource}
            onSelectionChange={handleResourceChange}
          >
            <ComboboxInput
              className={cn(
                "h-10 min-w-56",
                isComboboxDisabled &&
                  "cursor-not-allowed border-dashed bg-muted/40"
              )}
              disabled={isComboboxDisabled}
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
        </Field>
        <ButtonWithIcon
          className="w-full min-w-24 self-end transition-transform active:scale-[0.96] sm:w-auto"
          icon="output"
          isDisabled={!canExtract}
          isPending={isPending}
          onPress={handleExtract}
          size="xl"
        >
          {t("extract")}
        </ButtonWithIcon>
      </FieldGroup>
    </Box>
  )
}
