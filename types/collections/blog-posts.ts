import type { StatusType } from "@/types/enums/status-type"
import type { DirectusFileTypes } from "@/types/shared/directus-file"
import type { SeoTypes } from "@/types/collections/seo"
import type { BlogCategoriesTypes } from "@/types/collections/blog-categories"
import type { BlogPostsBodyJunction } from "@/types/collections/junctions/blog-posts-body"
import type { BlogPostsTagsJunction } from "@/types/collections/junctions/blog-posts-tags"

export interface BlogPostsTypes {
  // General
  id: string
  title: string
  slug: string | null
  published_at: "datetime"
  sort: number | null
  seo: string | SeoTypes
  status: StatusType
  image: string | DirectusFileTypes | null
  excerpt: string | null
  blog_category: string | BlogCategoriesTypes
  tags: number[] | BlogPostsTagsJunction[]
  body: number[] | BlogPostsBodyJunction[]
  // Audit
  date_created: "datetime"
  date_updated: "datetime"
}
