import { StaticLogo } from "@/assets/logos/static-logo"
import { Box } from "@/components/shared/content/Box"
import Link from "next/link"
import { Fragment } from "react/jsx-runtime"
import { metadata as createMetadata } from "@/lib/seo/metadata"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/components/shared/assets/MaterialIcon"

const BASE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string) || ""

export const metadata = createMetadata({
  title: "Página no encontrada",
  description: "Página no encontrada de BGL Básculas Industriales.",
  canonical: `${BASE_URL}/not-found`,
  openGraph: {
    title: "Página no encontrada",
    description: "Página no encontrada de BGL Básculas Industriales.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
})

export default function NotFound() {
  return (
    <Fragment>
      <Box
        className="3xl:max-w-8xl 2xl:max-w-8xl mx-auto h-dvh max-w-5xl lg:max-w-6xl xl:max-w-7xl"
        display="flex"
        orientation="vertical"
        padding={3}
        gap={1.5}
        align="center"
        justify="center"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col items-center">
              <StaticLogo className="aspect-auto h-32 w-auto" />
            </div>
            <h1 className="text-center font-mono text-6xl font-semibold text-muted-foreground">
              404
            </h1>
            <h2 className="text-center text-3xl font-semibold md:text-6xl">
              Página no encontrada
            </h2>
          </div>
          <p className="text-center text-muted-foreground">
            La página que buscas no existe o se ha movido. Revisa la URL o haz
            clic en el botón de abajo para volver a la página de inicio o
            cotizar un producto.
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <Link
              href="/inicio"
              title="Volver a la página de inicio"
              aria-label="Volver a la página de inicio"
              className="text-center text-primary"
            >
              <Button size="lg">
                <MaterialIcon name="arrow_back" />
                Volver a la página de inicio
              </Button>
            </Link>
            <Link
              href="/cotizar"
              title="Cotizar un producto"
              aria-label="Cotizar un producto"
              className="text-center text-primary"
            >
              <Button variant="red" size="lg">
                <MaterialIcon name="shopping_bag_speed" />
                Cotizar un producto
              </Button>
            </Link>
          </div>
          <p className="text-center text-muted-foreground">
            Si tienes alguna pregunta, no dudes en contactar con nuestro equipo
            de soporte técnico.
          </p>
          <Link
            href="/soporte"
            title="Contactar con el soporte técnico"
            aria-label="Contactar con el soporte técnico"
            className="text-center text-primary"
          >
            <Button size="lg" variant="secondary">
              <MaterialIcon name="support_agent" />
              Contactar soporte tecnico
            </Button>
          </Link>
        </div>
      </Box>
    </Fragment>
  )
}
