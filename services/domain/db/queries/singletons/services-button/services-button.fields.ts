import type { Query } from "@directus/sdk"
import type { Schema } from "@/types/schema"
import type { ServicesButtonType } from "@/types/singletons/services-button"

export const SERVICES_BUTTON_FIELDS = [
  "id",
  "title",
  "excerpt",
  "date_created",
  "date_updated",
  {
    services: [
      "id",
      "collection",
      {
        item: {
          services: [
            "id",
            "title",
            "slug",
            "status",
            "excerpt",
            "seo",
            "service_category",
            "date_created",
            "date_updated",
            {
              image: [
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
          ],
        },
      },
    ],
  },
] as const satisfies NonNullable<Query<Schema, ServicesButtonType>["fields"]>
