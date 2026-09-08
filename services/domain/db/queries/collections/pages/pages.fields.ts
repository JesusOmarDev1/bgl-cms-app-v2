import "server-only"

import type { Query } from "@directus/sdk"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { PagesTypes } from "@/types/collections/pages"
import type { Schema } from "@/types/schema"

export const PAGES_FIELDS = [
  "id",
  "title",
  "slug",
  "status",
  "excerpt",
  "date_created",
  "date_updated",
  { image: ["*"] },
  { seo: SEO_FIELDS },
  {
    body: [
      "id",
      "collection",
      {
        item: {
          faq_block: ["*"],
          map_block: ["*"],
          content_block: [
            "*",
            {
              content: [
                "id",
                "collection",
                { item: { content_column_block: ["*"] } },
              ],
            },
          ],
          cta_block: ["*"],
          form_block: [
            "*",
            {
              fields: [
                "id",
                "collection",
                {
                  item: {
                    text_block: ["*"],
                    text_area_block: ["*"],
                    number_block: ["*"],
                    date_block: ["*"],
                    email_block: ["*"],
                    checkbox_block: ["*"],
                    phone_block: ["*"],
                  },
                },
              ],
            },
          ],
          hero_block: [
            "*",
            {
              image: ["*"],
              images: ["id", { directus_files_id: ["*"] }],
              brands: [
                "id",
                {
                  brands_id: [
                    "id",
                    "title",
                    "excerpt",
                    { logo: ["*"] },
                    "slug",
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          qr_code_block: ["*"],
          media_block: ["*"],
          carousel_block: ["*"],
          clients_block: [
            "*",
            {
              clients: [
                "id",
                "collection",
                {
                  item: {
                    clients: [
                      "id",
                      "status",
                      "name",
                      "website",
                      "active",
                      "slug",
                      { logo: ["*"] },
                      "date_created",
                      "date_updated",
                    ],
                  },
                },
              ],
            },
          ],
          suppliers_block: [
            "*",
            {
              suppliers: [
                "id",
                "collection",
                {
                  item: {
                    suppliers: [
                      "id",
                      "name",
                      "status",
                      "active",
                      "website",
                      "slug",
                      { logo: ["*"] },
                      "date_created",
                      "date_updated",
                    ],
                  },
                },
              ],
            },
          ],
          brands_block: [
            "*",
            {
              brands: [
                "id",
                {
                  brands_id: [
                    "id",
                    "title",
                    "excerpt",
                    { logo: ["*"] },
                    "slug",
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          featured_services_block: [
            "*",
            {
              services: [
                "id",
                {
                  services_id: [
                    "id",
                    "title",
                    "slug",
                    "status",
                    "excerpt",
                    { image: ["*"] },
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          featured_products_block: [
            "*",
            {
              products: [
                "id",
                {
                  products_id: [
                    "id",
                    "slug",
                    "title",
                    "status",
                    "excerpt",
                    { image: ["*"] },
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          logos_clients_block: [
            "*",
            {
              clients: [
                "id",
                {
                  clients_id: [
                    "id",
                    "status",
                    "name",
                    "website",
                    "active",
                    "slug",
                    { logo: ["*"] },
                    "date_created",
                    "date_updated",
                  ],
                },
              ],
            },
          ],
          division_services_block: [
            "*",
            {
              division_services: [
                "id",
                {
                  division_services_id: [
                    "id",
                    "title",
                    "slug",
                    { image: ["*"] },
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
] as const satisfies NonNullable<Query<Schema, PagesTypes>["fields"]>
