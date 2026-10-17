import type { ApplyQueryFields } from "@directus/sdk"
import type { DirectusFileTypes } from "@/types/shared/directus/directus-file"
import type { Schema } from "@/types/schema"

export type DirectusFileQuery = ApplyQueryFields<
  Schema,
  DirectusFileTypes,
  readonly ["*"]
>
