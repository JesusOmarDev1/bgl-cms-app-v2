import type { Query } from "@directus/sdk"
import type { BlogCategoriesTypes } from "@/types/collections/blog-categories"
import type { Schema } from "@/types/schema"

export const BLOG_CATEGORIES_FIELDS = [
  "id",
  "title",
  "slug",
  "icon",
  "parent",
  { image: ["*"] },
  "status",
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, BlogCategoriesTypes>["fields"]>
