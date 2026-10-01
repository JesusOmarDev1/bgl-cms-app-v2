import { Document, Page } from "@formepdf/react"
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider"
import { Text } from "@/components/pdf/text"

export function DataSheetExample() {
  return (
    <Document>
      <Page size="A4">
        <PdfcnThemeProvider>
          <Text variant="xl">Ficha técnica</Text>
        </PdfcnThemeProvider>
      </Page>
    </Document>
  )
}
