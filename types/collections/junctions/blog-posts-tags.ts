import type { BlogPostsTypes } from "@/types/collections/blog-posts"
import type { TagTypes } from "@/types/collections/tags"

export interface BlogPostsTagsJunction {
  id: number
  blog_posts_id: string | BlogPostsTypes
  tags_id: string | TagTypes
}
