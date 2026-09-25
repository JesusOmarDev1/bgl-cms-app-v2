import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Pagination",
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("pagination.default")}
          description={t("pagination.default_hint")}
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" text={t("pagination.prev")} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive
                  aria-label={`${t("pagination.page")} 1`}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label={`${t("pagination.page")} 2`}
                >
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label={`${t("pagination.page")} 5`}
                >
                  5
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" text={t("pagination.next")} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </StoryBlock.Section>
        <StoryBlock.Section
          label={t("pagination.single")}
          description={t("pagination.single_hint")}
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" text={t("pagination.prev")} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive
                  aria-label={`${t("pagination.page")} 1`}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" text={t("pagination.next")} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
