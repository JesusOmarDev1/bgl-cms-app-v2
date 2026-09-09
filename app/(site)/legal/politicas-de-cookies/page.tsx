import { metadata as createMetadata } from "@/lib/seo/metadata"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { Fragment } from "react/jsx-runtime"
import Link from "next/link"
import { splitEmail } from "@/lib/formatting/split-email"

const BASE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string) || ""

export const metadata = createMetadata({
  title: "Políticas de Cookies",
  description: "Políticas de Cookies de BGL Básculas Industriales.",
  canonical: `${BASE_URL}/legal/politicas-de-cookies`,
  openGraph: {
    title: "Políticas de Cookies",
    description: "Políticas de Cookies de BGL Básculas Industriales.",
    type: "website",
  },
})

const EMAIL = "bglbasculas@gmail.com" as const

export default function Page() {
  return (
    <Fragment>
      <HeaderSpacer />
      <Box
        className="3xl:max-w-8xl 2xl:max-w-8xl mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl"
        padding={2}
        paddingInline={{ base: 1, sm: 1.5 }}
      >
        <div className="mb-4 flex flex-col gap-1.5 space-y-4">
          <div className="flex flex-col items-center">
            <StaticLogo className="aspect-auto h-32 w-auto" />
          </div>
          <h1 className="text-center text-3xl font-semibold md:text-6xl">
            Políticas de Privacidad
          </h1>
          <p className="text-center text-muted-foreground">
            Última actualización: Septiembre 2026
          </p>
        </div>
        <div className="typeset typeset-docs flex flex-col gap-4">
          <div>
            <h2>1. Introducción</h2>
            <p>
              Esta Política de Cookies describe qué son las cookies, cómo las
              utiliza BGL Básculas y tus opciones respecto a su gestión. Al
              continuar navegando en nuestro sitio, aceptas el uso de cookies
              conforme a esta política.
            </p>
          </div>
          <div>
            <h2>2. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web
              almacenan en tu dispositivo (ordenador, móvil, tablet) cuando los
              visitas. Permiten recordar tus preferencias, mejorar la
              experiencia de usuario y recopilar información estadística sobre
              el uso del sitio.
            </p>
          </div>
          <div>
            <h2>3. ¿Qué tipos de cookies utilizamos?</h2>
            <ul>
              <li>
                <strong>Cookies esenciales:</strong> Necesarias para el
                funcionamiento básico y seguro del sitio. Sin ellas, algunas
                funciones no estarían disponibles.
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> Permiten recordar tus
                configuraciones y personalizar la experiencia según tus
                elecciones previas.
              </li>
              <li>
                <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo
                interactúan los visitantes con el sitio, recopilando información
                anónima para mejorar nuestros servicios (por ejemplo, Google
                Analytics).
              </li>
              <li>
                <strong>Cookies de terceros:</strong> Algunos servicios
                externos, como herramientas de análisis o redes sociales, pueden
                instalar sus propias cookies cuando interactúas con nuestro
                contenido.
              </li>
            </ul>
          </div>
          <div>
            <h2>4. ¿Cómo usamos las cookies?</h2>
            <p>Utilizamos cookies para:</p>
            <ul>
              <li>
                Garantizar la seguridad y el funcionamiento técnico del sitio.
              </li>
              <li>Recordar tus preferencias y facilitar la navegación.</li>
              <li>
                Analizar el tráfico y el comportamiento de los usuarios para
                optimizar nuestros servicios.
              </li>
              <li>
                Personalizar el contenido y mostrar información relevante.
              </li>
            </ul>
          </div>
          <div>
            <h2>5. ¿Cómo puedes gestionar las cookies?</h2>
            <p>
              Puedes configurar tu navegador para aceptar, rechazar o eliminar
              cookies en cualquier momento. La mayoría de los navegadores
              permiten gestionar las cookies a través de sus opciones de
              configuración. Ten en cuenta que deshabilitar cookies puede
              afectar el funcionamiento de algunas partes del sitio.
            </p>
            <ul>
              <li>
                <strong>Google Chrome:</strong>{" "}
                <Link
                  href="https://support.google.com/chrome/answer/95647?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instrucciones
                </Link>
              </li>
              <li>
                <strong>Mozilla Firefox:</strong>{" "}
                <Link
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instrucciones
                </Link>
              </li>
              <li>
                <strong>Safari:</strong>{" "}
                <Link
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instrucciones
                </Link>
              </li>
              <li>
                <strong>Microsoft Edge:</strong>{" "}
                <Link
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instrucciones
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>6. Cambios en la política de cookies</h2>
            <p>
              Podemos actualizar esta política ocasionalmente para reflejar
              cambios en la legislación o en nuestras prácticas internas. Te
              recomendamos revisar esta página periódicamente para estar
              informado sobre cómo usamos las cookies.
            </p>
          </div>
          <div>
            <h2>7. Contacto</h2>
            <p>
              Si tienes dudas o comentarios sobre nuestra política de cookies,
              puedes contactarnos en{" "}
              <Link
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {splitEmail(EMAIL)?.localPart}@{splitEmail(EMAIL)?.domain}
              </Link>
              .
            </p>
          </div>
        </div>
      </Box>
    </Fragment>
  )
}
