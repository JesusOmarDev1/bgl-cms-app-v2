import { metadata as createMetadata } from "@/lib/seo/metadata"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { Fragment } from "react/jsx-runtime"
import Link from "next/link"
import { splitEmail } from "@/lib/formatting/split-email"

const BASE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string) || ""

export const metadata = createMetadata({
  title: "Términos de Uso y Datos",
  description: "Términos de Uso y Datos de BGL Básculas Industriales.",
  canonical: `${BASE_URL}/legal/terminos-de-uso-y-datos`,
  openGraph: {
    title: "Términos de Uso y Datos",
    description: "Términos de Uso y Datos de BGL Básculas Industriales.",
    type: "website",
  },
})

const EMAIL = "soporte@bglbasculas.com" as const

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
            Términos de Uso y Datos
          </h1>
          <p className="text-center text-muted-foreground">
            Última actualización: Septiembre 2026
          </p>
        </div>
        <div className="typeset typeset-docs flex flex-col gap-4">
          <section>
            <h2>1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web de BGL Básculas, aceptas
              cumplir con estos Términos de Uso en su totalidad. Si no estás de
              acuerdo con alguna de estas condiciones, te pedimos que no
              utilices el sitio. El uso continuado del sitio constituye la
              aceptación de cualquier modificación a estos términos.
            </p>
          </section>
          <section>
            <h2>2. Descripción del servicio</h2>
            <p>
              BGL Básculas es una empresa dedicada a soluciones de pesaje
              industrial. A través de nuestro sitio web ofrecemos:
            </p>
            <ul>
              <li>
                Información sobre nuestros productos, servicios y marcas
                disponibles.
              </li>
              <li>
                Catálogo de productos con especificaciones técnicas y
                características.
              </li>
              <li>
                Formularios de contacto y cotización para solicitar información
                o servicios.
              </li>
              <li>
                Contenido informativo a través de nuestro blog y secciones
                educativas.
              </li>
              <li>Herramientas de búsqueda para facilitar la navegación.</li>
            </ul>
          </section>
          <section>
            <h2>3. Uso aceptable del sitio</h2>
            <p>Al utilizar nuestro sitio web, te comprometes a:</p>
            <ul>
              <li>
                Utilizar el sitio únicamente para fines legales y de acuerdo con
                estos términos.
              </li>
              <li>
                No intentar acceder de forma no autorizada a nuestros sistemas,
                servidores o bases de datos.
              </li>
              <li>
                No realizar acciones que puedan dañar, sobrecargar o deteriorar
                el funcionamiento del sitio.
              </li>
              <li>
                No utilizar herramientas automatizadas (bots, scrapers) para
                extraer contenido sin autorización previa.
              </li>
              <li>
                No enviar información falsa, engañosa o que infrinja derechos de
                terceros a través de nuestros formularios.
              </li>
              <li>
                No suplantar la identidad de otra persona o entidad al
                interactuar con nuestros servicios.
              </li>
            </ul>
          </section>
          <section>
            <h2>4. Propiedad intelectual</h2>
            <p>
              Todo el contenido publicado en este sitio web, incluyendo pero no
              limitado a textos, imágenes, logotipos, gráficos, videos, diseño,
              estructura, código fuente y software, es propiedad de BGL Básculas
              o de sus respectivos titulares y está protegido por las leyes de
              propiedad intelectual e industrial aplicables en México.
            </p>
            <p>Queda expresamente prohibido:</p>
            <ul>
              <li>
                Reproducir, distribuir, modificar o utilizar comercialmente
                cualquier contenido del sitio sin autorización escrita previa.
              </li>
              <li>
                Utilizar las marcas, logotipos o nombres comerciales de BGL
                Básculas sin consentimiento expreso.
              </li>
              <li>
                Descompilar, realizar ingeniería inversa o intentar extraer el
                código fuente del sitio.
              </li>
            </ul>
          </section>
          <section>
            <h2>5. Información de productos y servicios</h2>
            <p>
              Nos esforzamos por mantener la información de nuestros productos y
              servicios actualizada y precisa. Sin embargo:
            </p>
            <ul>
              <li>
                Las especificaciones técnicas, precios y disponibilidad pueden
                cambiar sin previo aviso.
              </li>
              <li>
                Las imágenes de productos son ilustrativas y pueden diferir del
                producto real.
              </li>
              <li>
                La información publicada no constituye una oferta vinculante.
                Para obtener cotizaciones formales, contáctanos directamente.
              </li>
            </ul>
          </section>
          <section>
            <h2>6. Formularios y envío de datos</h2>
            <p>
              Al utilizar nuestros formularios de contacto, cotización u otros
              medios de comunicación del sitio:
            </p>
            <ul>
              <li>
                Te comprometes a proporcionar información veraz, completa y
                actualizada.
              </li>
              <li>
                Aceptas que los datos proporcionados serán tratados conforme a
                nuestra{" "}
                <Link
                  href="/legal/politicas-de-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Políticas de Privacidad
                </Link>
                .
              </li>
              <li>
                Entiendes que el envío de un formulario no genera
                automáticamente una relación contractual.
              </li>
            </ul>
          </section>
          <section>
            <h2>7. Enlaces a sitios de terceros</h2>
            <p>
              Nuestro sitio puede contener enlaces a sitios web de terceros
              (proveedores, marcas asociadas, redes sociales, etc.). Estos
              enlaces se proporcionan únicamente como referencia y conveniencia.
              BGL Básculas no controla ni se responsabiliza del contenido,
              políticas de privacidad o prácticas de estos sitios externos.
            </p>
          </section>
          <section>
            <h2>8. Limitación de responsabilidad</h2>
            <p>BGL Básculas no será responsable por:</p>
            <ul>
              <li>
                Daños directos, indirectos, incidentales o consecuentes
                derivados del uso o la imposibilidad de uso de este sitio web.
              </li>
              <li>
                Interrupciones temporales del servicio por mantenimiento, fallos
                técnicos o causas de fuerza mayor.
              </li>
              <li>
                La exactitud, integridad o actualidad de la información
                publicada por terceros en el sitio.
              </li>
              <li>
                Pérdidas resultantes de accesos no autorizados a tus datos
                cuando estos se deban a negligencia en la protección de tus
                credenciales.
              </li>
            </ul>
          </section>
          <section>
            <h2>9. Disponibilidad del sitio</h2>
            <p>
              Nos esforzamos por mantener el sitio disponible de forma continua.
              Sin embargo, no garantizamos que el servicio sea ininterrumpido o
              libre de errores. Nos reservamos el derecho de suspender,
              modificar o descontinuar cualquier aspecto del sitio en cualquier
              momento y sin previo aviso.
            </p>
          </section>
          <section>
            <h2>10. Modificaciones a los términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos de Uso en
              cualquier momento. Las modificaciones entrarán en vigor desde su
              publicación en esta página. Te recomendamos revisar esta sección
              periódicamente para estar al tanto de cualquier cambio.
            </p>
          </section>
          <section>
            <h2>11. Legislación aplicable</h2>
            <p>
              Estos Términos de Uso se rigen por las leyes vigentes en los
              Estados Unidos Mexicanos. Cualquier controversia derivada del uso
              de este sitio web será sometida a la jurisdicción de los
              tribunales competentes en el estado donde BGL Básculas tiene su
              domicilio fiscal.
            </p>
          </section>
          <section>
            <h2>12. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos Términos de Uso, puedes
              contactarnos en{" "}
              <Link
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {splitEmail(EMAIL)?.localPart}@{splitEmail(EMAIL)?.domain}
              </Link>
              .
            </p>
          </section>
        </div>
      </Box>
    </Fragment>
  )
}
