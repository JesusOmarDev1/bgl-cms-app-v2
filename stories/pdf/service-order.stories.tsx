/// <reference types="vite/client" />
import { useEffect, useState } from "react"
import { init, renderDocument } from "@formepdf/core/worker"
import wasmUrl from "@formepdf/core/pkg-web/forme_bg.wasm?url"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import { ServiceOrderPreview } from "@/components/pdf/templates/service-order"

const partnerLogos = [
  {
    id: "rice-lake",
    url: new URL("../../assets/logos/pdf/rice_lake.png", import.meta.url).href,
  },
  {
    id: "revuelta",
    url: new URL(
      "../../assets/logos/pdf/basculas_revuelta.png",
      import.meta.url
    ).href,
  },
  {
    id: "torrey",
    url: new URL("../../assets/logos/pdf/torrey.png", import.meta.url).href,
  },
  {
    id: "anyload",
    url: new URL("../../assets/logos/pdf/anyload.png", import.meta.url).href,
  },
  {
    id: "gse",
    url: new URL("../../assets/logos/pdf/gse.png", import.meta.url).href,
  },
  {
    id: "kretz",
    url: new URL("../../assets/logos/pdf/kretz.png", import.meta.url).href,
  },
  {
    id: "epson",
    url: new URL("../../assets/logos/pdf/epson.png", import.meta.url).href,
  },
]

function ServiceOrderStory() {
  const [pdfUrl, setPdfUrl] = useState<string>()
  const [error, setError] = useState<string>()

  // Static local Storybook assets; cleanup revokes the generated PDF URL.
  // eslint-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    let cancelled = false
    let url: string | undefined
    async function generate() {
      try {
        const logos = partnerLogos.map(({ id, url }) => ({ id, src: url }))
        const brandLogo = new URL("/static/logo-dark.png", window.location.href)
          .href
        const footerLogo = new URL(
          "/static/inverted-logo.png",
          window.location.href
        ).href
        await init(new URL(wasmUrl, window.location.href))
        const bytes = await renderDocument(
          <ServiceOrderPreview
            logos={logos}
            brandLogo={brandLogo}
            footerLogo={footerLogo}
          />
        )
        url = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
        )
        if (cancelled) URL.revokeObjectURL(url)
        else setPdfUrl(url)
      } catch (reason) {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : String(reason))
      }
    }
    void generate()
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  return (
    <div
      style={{
        background: "#181818",
        minHeight: "100vh",
        padding: 24,
        textAlign: "center",
      }}
    >
      {error ? <p role="alert">No se pudo generar el PDF: {error}</p> : null}
      {!error && !pdfUrl ? <p>Generando vista previa del PDF…</p> : null}
      {pdfUrl ? (
        <embed
          title="Orden de servicio — PDF de muestra"
          src={pdfUrl}
          style={{
            background: "white",
            border: 0,
            height: 1060,
            maxWidth: "100%",
            width: 790,
          }}
        />
      ) : null}
    </div>
  )
}

const meta = {
  title: "PDF/Orden de servicio (prototipo pdfcn)",
  component: ServiceOrderStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ServiceOrderStory>

export default meta
type Story = StoryObj<typeof meta>

export const FormularioEnBlanco: Story = {
  play: async ({ canvasElement }) => {
    const iframe = (await within(canvasElement).findByTitle(
      "Orden de servicio — PDF de muestra",
      {},
      { timeout: 30000 }
    )) as HTMLIFrameElement
    const bytes = new Uint8Array(await (await fetch(iframe.src)).arrayBuffer())
    await expect(new TextDecoder().decode(bytes.subarray(0, 5))).toBe("%PDF-")
    const pdf = new TextDecoder("latin1").decode(bytes)
    await expect(
      pdf.match(/\/Subtype\s*\/Image\b/g)?.length ?? 0
    ).toBeGreaterThanOrEqual(9)
  },
}
