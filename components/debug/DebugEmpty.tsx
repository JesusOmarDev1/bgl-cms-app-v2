import { getTranslations } from "next-intl/server"

import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export async function DebugEmpty() {
  const t = await getTranslations("debug")

  return (
    <Empty className="rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MaterialIcon name="data_object" />
        </EmptyMedia>
        <EmptyTitle className="text-balance">{t("emptyTitle")}</EmptyTitle>
        <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
