import { StaticLogo } from "@/assets/logos/static-logo"
import { Box } from "@/components/shared/content/Box"
import Link from "next/link"
import { Fragment } from "react/jsx-runtime"

export default function NotFound() {
  return (
    <Box className="3xl:max-w-8xl 2xl:max-w-8xl mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl">
      <Fragment>
        <div className="mb-4 flex flex-col gap-1.5 space-y-4">
          <div className="flex flex-col items-center">
            <StaticLogo className="aspect-auto h-32 w-auto" />
          </div>
          <h1 className="text-center text-3xl font-semibold md:text-6xl">
            Página no encontrada
          </h1>
        </div>
        <p className="text-center text-muted-foreground">
          No se encontró el recurso solicitado
        </p>
        <Link href="/" className="text-center text-primary">
          Volver a la página de inicio
        </Link>
      </Fragment>
    </Box>
  )
}
