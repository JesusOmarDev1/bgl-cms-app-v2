import type { Query } from "@directus/sdk"
import type { UrlLinksTypes } from "@/types/collections/url-links"
import type { Schema } from "@/types/schema"

export const URL_LINKS_FIELDS = [
  "id",
  "title",
  "url",
  "type",
  "icon",
  {
    sub_links: [
      "id",
      "url_links_id",
      {
        sub_links_id: [
          "id",
          "title",
          "url",
          "icon",
          "date_created",
          "date_updated",
        ],
      },
    ],
  },
  "date_created",
  "date_updated",
] as const satisfies NonNullable<Query<Schema, UrlLinksTypes>["fields"]>
