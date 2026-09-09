import { metadata as createMetadata } from "@/lib/seo/metadata"
import { Box } from "@/components/shared/content/Box"
import { StaticLogo } from "@/assets/logos/static-logo"
import { HeaderSpacer } from "@/components/blocks/singletons/header/HeaderSpacer"
import { Fragment } from "react/jsx-runtime"
import Link from "next/link"
import { splitEmail } from "@/lib/formatting/split-email"

const BASE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string) || ""

export const metadata = createMetadata({
  title: "Políticas de Seguridad",
  description: "Políticas de Seguridad de BGL Básculas Industriales.",
  canonical: `${BASE_URL}/legal/politicas-de-seguridad`,
  openGraph: {
    title: "Políticas de Seguridad",
    description: "Políticas de Seguridad de BGL Básculas Industriales.",
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
            Políticas de Seguridad
          </h1>
          <p className="text-center text-muted-foreground">
            Última actualización: Septiembre 2026
          </p>
        </div>
        <div className="typeset typeset-docs flex flex-col gap-4">
          <div>
            <h2>1. Introducción</h2>
            <p>
              En BGL Básculas nos comprometemos a proteger la seguridad de la
              información de nuestros usuarios, clientes y socios. Esta Política
              de Seguridad describe las medidas técnicas y organizativas que
              implementamos para garantizar la confidencialidad, integridad y
              disponibilidad de los datos que gestionamos a través de nuestro
              sitio web y servicios digitales.
            </p>
          </div>
          <div>
            <h2>2. Alcance</h2>
            <p>
              Esta política aplica a toda la infraestructura digital de BGL
              Básculas, incluyendo:
            </p>
            <ul>
              <li>
                El sitio web público y todos sus subdominios y servicios
                asociados.
              </li>
              <li>
                Las APIs y endpoints utilizados para la gestión de contenido y
                datos.
              </li>
              <li>
                Los sistemas de gestión de contenido (CMS) y bases de datos
                conectados.
              </li>
              <li>
                Los formularios de contacto, búsqueda y cualquier funcionalidad
                que reciba datos del usuario.
              </li>
            </ul>
          </div>
          <div>
            <h2>3. Medidas de protección técnicas</h2>
            <p>
              Implementamos las siguientes medidas para proteger la información:
            </p>
            <ul>
              <li>
                <strong>Cifrado en tránsito:</strong> Todas las comunicaciones
                entre tu navegador y nuestros servidores están protegidas
                mediante HTTPS/TLS, garantizando que los datos no puedan ser
                interceptados durante la transmisión.
              </li>
              <li>
                <strong>Protección contra bots y ataques:</strong> Utilizamos
                sistemas de detección de bots y protección contra ataques
                automatizados en nuestras rutas de API para prevenir el uso
                indebido.
              </li>
              <li>
                <strong>Rate limiting:</strong> Aplicamos límites de velocidad
                en las solicitudes a nuestras APIs para prevenir ataques de
                fuerza bruta, denegación de servicio (DoS) y abuso de recursos.
              </li>
              <li>
                <strong>Validación de datos:</strong> Todos los datos recibidos
                son validados y sanitizados tanto en el cliente como en el
                servidor para prevenir inyecciones de código, XSS y otros
                vectores de ataque.
              </li>
              <li>
                <strong>Tokens y claves protegidas:</strong> Las credenciales de
                acceso, tokens de autenticación y claves de API se almacenan de
                forma segura en el servidor y nunca se exponen al código del
                cliente.
              </li>
              <li>
                <strong>Verificación humana:</strong> Utilizamos sistemas de
                verificación (CAPTCHA) en formularios sensibles para garantizar
                que las interacciones provienen de usuarios reales.
              </li>
            </ul>
          </div>
          <div>
            <h2>4. Protección de datos personales</h2>
            <p>
              Tu información personal está protegida de acuerdo con nuestra{" "}
              <Link
                href="/legal/politicas-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidad
              </Link>
              . Adicionalmente:
            </p>
            <ul>
              <li>
                El acceso a los datos personales está restringido únicamente al
                personal autorizado que lo necesita para cumplir sus funciones.
              </li>
              <li>
                Realizamos auditorías periódicas de acceso para detectar y
                prevenir accesos no autorizados.
              </li>
              <li>
                Los datos sensibles se almacenan cifrados y se transmiten
                únicamente por canales seguros.
              </li>
            </ul>
          </div>
          <div>
            <h2>5. Gestión de incidentes de seguridad</h2>
            <p>
              Contamos con procedimientos definidos para la gestión de
              incidentes de seguridad:
            </p>
            <ul>
              <li>
                <strong>Detección:</strong> Monitoreamos continuamente nuestros
                sistemas para identificar actividades sospechosas o inusuales.
              </li>
              <li>
                <strong>Respuesta:</strong> Ante un incidente de seguridad,
                activamos un protocolo de respuesta que incluye contención,
                análisis y remediación.
              </li>
              <li>
                <strong>Notificación:</strong> En caso de una brecha de
                seguridad que afecte datos personales, notificaremos a los
                usuarios afectados y a las autoridades competentes en los plazos
                establecidos por la legislación vigente.
              </li>
              <li>
                <strong>Mejora continua:</strong> Después de cada incidente,
                realizamos un análisis post-mortem para fortalecer nuestras
                defensas y prevenir recurrencias.
              </li>
            </ul>
          </div>
          <div>
            <h2>6. Responsabilidades del usuario</h2>
            <p>
              Para mantener la seguridad de tu información, te recomendamos:
            </p>
            <ul>
              <li>
                No compartir tus credenciales de acceso ni información personal
                sensible a través de canales no seguros.
              </li>
              <li>
                Mantener tu navegador y sistema operativo actualizados para
                beneficiarte de los últimos parches de seguridad.
              </li>
              <li>
                Reportar cualquier actividad sospechosa o vulnerabilidad que
                detectes en nuestro sitio web.
              </li>
              <li>
                Verificar que la URL del sitio comience con{" "}
                <strong>https://</strong> antes de ingresar información
                personal.
              </li>
            </ul>
          </div>
          <div>
            <h2>7. Servicios de terceros</h2>
            <p>
              Utilizamos servicios de terceros que cumplen con estándares de
              seguridad reconocidos para funciones como:
            </p>
            <ul>
              <li>Alojamiento y entrega de contenido (CDN).</li>
              <li>Analítica web y monitoreo de rendimiento.</li>
              <li>Gestión de contenido y almacenamiento de datos.</li>
              <li>Protección contra amenazas y detección de bots.</li>
            </ul>
            <p>
              Evaluamos periódicamente la seguridad de estos proveedores y
              mantenemos acuerdos contractuales que garantizan la protección de
              los datos.
            </p>
          </div>
          <div>
            <h2>8. Actualizaciones y mantenimiento</h2>
            <p>
              Mantenemos nuestros sistemas actualizados con los últimos parches
              de seguridad. Realizamos revisiones periódicas de nuestra
              infraestructura y código para identificar y corregir posibles
              vulnerabilidades antes de que puedan ser explotadas.
            </p>
          </div>
          <div>
            <h2>9. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta Política de Seguridad periódicamente para
              reflejar mejoras en nuestras prácticas o cambios en la
              legislación. Publicaremos las actualizaciones en esta página con
              la fecha de última modificación.
            </p>
          </div>
          <div>
            <h2>10. Reporte de vulnerabilidades</h2>
            <p>
              Si descubres una vulnerabilidad de seguridad en nuestro sitio web,
              te pedimos que nos la reportes de forma responsable antes de
              divulgarla públicamente. Puedes contactarnos en{" "}
              <Link
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {splitEmail(EMAIL)?.localPart}@{splitEmail(EMAIL)?.domain}
              </Link>
              . Nos comprometemos a investigar y responder a todos los reportes
              de seguridad en el menor tiempo posible.
            </p>
          </div>
        </div>
      </Box>
    </Fragment>
  )
}
