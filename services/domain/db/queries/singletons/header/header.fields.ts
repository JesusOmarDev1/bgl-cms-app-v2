import type { Query } from "@directus/sdk"

import type { Schema } from "@/types/schema"
import type { HeaderType } from "@/types/singletons/header"

export const HEADER_FIELDS = [
  "id",
  "primary_button",
  "primary_url",
  "primary_icon",
  "secondary_button",
  "secondary_url",
  "secondary_icon",
  "date_created",
  "date_updated",
  {
    logo_dark: [
      "id",
      "title",
      "filename_download",
      "type",
      "width",
      "height",
      "filesize",
      "created_on",
      "modified_on",
      "uploaded_on",
    ],
    url_links: [
      "id",
      "collection",
      {
        item: {
          url_links: [
            "id",
            "title",
            "url",
            "type",
            "icon",
            "date_created",
            "date_updated",
            {
              sub_links: [
                "id",
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
          ],
        },
      },
    ],
    social_links: [
      "id",
      "collection",
      {
        item: {
          social_links: [
            "id",
            "title",
            "type",
            "url",
            "date_created",
            "date_updated",
          ],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, HeaderType>["fields"]>
