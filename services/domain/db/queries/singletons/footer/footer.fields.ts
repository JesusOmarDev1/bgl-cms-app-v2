import type { Query } from "@directus/sdk"
import type { Schema } from "@/types/schema"
import type { FooterType } from "@/types/singletons/footer"

export const FOOTER_FIELDS = [
  "id",
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
  },
  {
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
  },
  {
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
  {
    phones: [
      "id",
      "collection",
      {
        item: {
          phones: [
            "id",
            "name",
            "phone",
            "position",
            "date_created",
            "date_updated",
          ],
        },
      },
    ],
  },
  {
    emails: [
      "id",
      "collection",
      {
        item: {
          emails: ["id", "name", "email", "position"],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, FooterType>["fields"]>
