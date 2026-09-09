import { metadata as createMetadata } from "@/lib/seo/metadata"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { Fragment } from "react/jsx-runtime"
import Link from "next/link"
import { splitEmail } from "@/lib/formatting/split-email"

const BASE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string) || ""

export const metadata = createMetadata({
  title: "Políticas de Privacidad",
  description: "Políticas de Privacidad de BGL Básculas Industriales.",
  canonical: `${BASE_URL}/legal/politicas-de-privacidad`,
  openGraph: {
    title: "Políticas de Privacidad",
    description: "Políticas de Privacidad de BGL Básculas Industriales.",
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
        <div className="typeset typeset-docs">
          <h2>1. Introducción</h2>
          <p>
            En BGL Básculas, tu privacidad es fundamental. Esta política explica
            cómo recopilamos, usamos, almacenamos y protegemos tu información
            personal cuando accedes a nuestro sitio web y servicios. Al utilizar
            nuestros servicios, aceptas las prácticas descritas aquí.
          </p>
          <h2>2. Información que recopilamos</h2>
          <ul>
            <li>
              <strong>Datos de contacto:</strong> Nombre, correo electrónico,
              teléfono y otros datos que nos proporcionas al registrarte,
              contactar o solicitar información.
            </li>
            <li>
              <strong>Datos técnicos:</strong> Dirección IP, tipo de
              dispositivo, sistema operativo, navegador, páginas visitadas,
              fecha y hora de acceso.
            </li>
            <li>
              <strong>Datos de uso:</strong> Preferencias, interacciones,
              búsquedas y acciones dentro del sitio.
            </li>
            <li>
              <strong>Datos de terceros:</strong> Información proveniente de
              servicios externos (por ejemplo, Google, redes sociales) si
              interactúas o te autenticas mediante ellos.
            </li>
          </ul>
          <h2>3. Finalidad y uso de los datos</h2>
          <ul>
            <li>
              Prestar, mantener y mejorar nuestros servicios y funcionalidades.
            </li>
            <li>Personalizar la experiencia y mostrar contenido relevante.</li>
            <li>Responder consultas, solicitudes y brindar soporte.</li>
            <li>
              Enviar comunicaciones sobre productos, servicios o novedades (solo
              si lo autorizas).
            </li>
            <li>
              Analizar el uso del sitio para optimizar la experiencia y
              seguridad.
            </li>
            <li>Cumplir obligaciones legales, fiscales y de seguridad.</li>
          </ul>
          <h2>4. Base legal para el tratamiento</h2>
          <p>
            Procesamos tus datos personales bajo las siguientes bases legales:
            consentimiento explícito, cumplimiento de obligaciones
            contractuales, interés legítimo y cumplimiento de obligaciones
            legales.
          </p>
          <h2>5. Compartir datos con terceros</h2>
          <p>
            No vendemos ni compartimos tu información personal con terceros,
            salvo en los siguientes casos:
          </p>
          <ul>
            <li>
              Proveedores de servicios tecnológicos (hosting, analítica, email,
              soporte) que actúan bajo contrato y confidencialidad.
            </li>
            <li>
              Obligaciones legales, requerimientos de autoridades o procesos
              judiciales.
            </li>
            <li>
              Transferencias internacionales de datos, solo si es necesario y
              bajo protección legal adecuada.
            </li>
          </ul>
          <h2>6. Seguridad de la información</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus
            datos contra accesos no autorizados, pérdida, alteración o
            divulgación. Usamos cifrado, control de acceso, monitoreo y
            auditorías periódicas. Sin embargo, ningún sistema es 100% seguro y
            te recomendamos proteger tu información.
          </p>
          <h2>7. Conservación de los datos</h2>
          <p>
            Conservamos tus datos personales solo el tiempo necesario para
            cumplir con las finalidades descritas y obligaciones legales. Cuando
            ya no sean necesarios, los eliminamos o anonimizamos de forma
            segura.
          </p>
          <h2>8. Derechos de los usuarios</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, cancelación,
            oposición, portabilidad y limitación enviando una solicitud a
            nuestro correo. También puedes retirar tu consentimiento en
            cualquier momento.
          </p>
          <h2>9. Uso de cookies y tecnologías similares</h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar la
            experiencia, analizar el uso y personalizar el contenido. Consulta
            nuestra{" "}
            <Link
              href="/legal/politicas-de-cookies"
              aria-label="Política de Cookies"
              title="Política de Cookies"
            >
              Política de Cookies
            </Link>{" "}
            para más detalles.
          </p>
          <h2>10. Enlaces a sitios externos</h2>
          <p>
            Nuestro sitio puede contener enlaces a sitios web de terceros. No
            somos responsables de sus políticas de privacidad ni de sus
            contenidos. Te recomendamos revisar las políticas de cada sitio
            externo que visites.
          </p>
          <h2>11. Cambios en la política de privacidad</h2>
          <p>
            Podemos actualizar esta política para reflejar cambios legales,
            técnicos o en nuestras prácticas. Publicaremos los cambios en esta
            página y, si son significativos, te lo notificaremos por los medios
            habituales.
          </p>
          <h2>12. Contacto</h2>
          <p>
            Si tienes dudas, comentarios o deseas ejercer tus derechos,
            contáctanos en{" "}
            <Link
              href="mailto:bglbasculas@gmail.com"
              aria-label="Correo electrónico"
              title="Correo electrónico"
            >
              {splitEmail(EMAIL)?.localPart}@{splitEmail(EMAIL)?.domain}
            </Link>{" "}
            . Puedes contactar a través de este correo electrónico para
            cualquier consulta o solicitud.
          </p>
        </div>
      </Box>
    </Fragment>
  )
}
