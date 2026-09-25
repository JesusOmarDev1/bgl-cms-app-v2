import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useTranslations } from "next-intl"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { StoryBlock } from "../../components/storybook/StoryBlock"

const meta = {
  title: "UI/Table",
  component: Table,
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const t = useTranslations("storybook")

    const rows = [
      {
        nombre: t("table.row1_name"),
        rol: t("table.row1_role"),
        estado: t("table.row1_status"),
      },
      {
        nombre: t("table.row2_name"),
        rol: t("table.row2_role"),
        estado: t("table.row2_status"),
      },
      {
        nombre: t("table.row3_name"),
        rol: t("table.row3_role"),
        estado: t("table.row3_status"),
      },
    ]

    return (
      <StoryBlock>
        <StoryBlock.Section
          label={t("table.with_data")}
          description={t("table.with_data_hint")}
          stack
          className="max-w-2xl"
        >
          <Table aria-label={t("table.aria")} className="max-w-2xl">
            <TableCaption>{t("table.caption")}</TableCaption>
            <TableHeader>
              <TableHead isRowHeader>{t("table.col_name")}</TableHead>
              <TableHead>{t("table.col_role")}</TableHead>
              <TableHead>{t("table.col_status")}</TableHead>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.nombre}>
                  <TableCell>{row.nombre}</TableCell>
                  <TableCell>{row.rol}</TableCell>
                  <TableCell>{row.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>{t("table.footer")}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </StoryBlock.Section>
      </StoryBlock>
    )
  },
}
