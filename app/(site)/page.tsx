import { metadata as createMetadata } from "@/lib/seo/metadata"

export const metadata = createMetadata({
  title: "Inicio",
  description: "Sitio web de BGL Básculas Industriales.",
  openGraph: {
    title: "Inicio",
    description: "Sitio web de BGL Básculas Industriales.",
    type: "website",
  },
})

export default function Page() {
  return <></>
}
