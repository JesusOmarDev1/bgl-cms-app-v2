# Plan de errores de Directus, mensajes i18n y logger

Estado: logger seguro y trazado de solicitudes implementados; clasificación de errores del servidor y catálogo i18n incorporados. Falta la verificación global y conectar mensajes a los futuros flujos privados; sin cambios al servidor Directus. Este documento concentra la investigación y las decisiones pendientes del manejo de errores y del logger. El plan funcional del área privada permanece en [area-privada-metrologia.md](area-privada-metrologia.md).

## Resultado buscado

Informar con mensajes útiles y seguros los fallos de consultas públicas y operaciones privadas, sin confundir «no hay datos» con un error ni revelar información sensible en la interfaz o los logs. Mantener la semántica de los consumidores públicos actuales mientras se incorpora una clasificación explícita para las operaciones privadas.

## Estado de T3: clasificación e i18n implementadas

`lib/directus/classify-error.ts` es un helper de servidor con categorías finitas y prioridad explícita: sesión vencida, identidad inválida, acceso denegado/no visible, límite de solicitudes, indisponibilidad, validación y error genérico. Revisa todos los `errors[]` del SDK y `data.errors` de ofetch aunque otros elementos estén malformados; solo devuelve códigos de diagnóstico reconocidos, marca los desconocidos sin exponerlos y acepta únicamente estados HTTP enteros entre 100 y 599. Detecta errores de transporte sin analizar mensajes ni payloads. Un 403 solo produce «acceso denegado/no disponible» y nunca afirma que el recurso exista.

`lib/directus/query-error.ts` conserva su contrato `void`, los códigos de warning existentes y los fallbacks públicos. La clasificación no registra texto, códigos Flow desconocidos ni cuerpos; el logger sigue aplicando su filtrado seguro. `i18n/messages/es/directus-errors.json` contiene los mensajes del catálogo `directusErrors` y `i18n/request.ts` lo ensambla estáticamente sin APIs de runtime. No se agrega categoría específica de inicio de sesión porque las consultas públicas no aportan evidencia de ese contexto.

Para una mutación indicada explícitamente como tal, un fallo de transporte o HTTP 5xx se clasifica como `resultUnknown`, con mensaje propio que pide verificar el estado antes de intentar nuevamente: no se promete reintento seguro ni se repite automáticamente. No existen formularios ni rutas privadas en esta integración; el consumo privado, errores por campo permitidos y comprobación del estado de escrituras quedan pendientes para su contrato futuro.

## Hechos verificados

- La [documentación oficial de errores](https://directus.com/docs/guides/connect/errors#error-response-shape) define `errors[]`, con `message` y `extensions.code` por error; puede haber más de uno. `extensions` puede incluir campo, valor, colección y, en desarrollo, un stack. Los códigos oficiales y sus estados están en la [misma página](https://directus.com/docs/guides/connect/errors#error-codes). Extensiones y Flows pueden agregar otros códigos.
- Directus responde `FORBIDDEN` (403) también por elementos que no existen, para no revelar su existencia. `INVALID_TOKEN` es 403, `TOKEN_EXPIRED` es 401, `LIMIT_EXCEEDED` es 403 y `REQUESTS_EXCEEDED` es 429; no son intercambiables. Un fallo de transporte puede no tener respuesta HTTP ni `extensions.code`.
- El SDK instalado (`@directus/sdk` 24.0.0) exporta `isDirectusError` y tipa `DirectusError` con `errors: DirectusApiError[]`, `response` y `data?` (`node_modules/@directus/sdk/dist/types/error.d.ts`, `utils/is-directus-error.d.ts`). Con el transporte fetch predeterminado, `response.status` permite examinar el HTTP. Suponer `error.errors[0]` no cubre todos los errores de una respuesta.
- Estado posterior a T3: `lib/directus/query-error.ts` usa el clasificador, conserva `FORBIDDEN`, `INVALID_TOKEN` y `LIMIT_EXCEEDED` como warning cuando todos los códigos son warnings conocidos, y envía solo componente, operación, colección permitida por el logger, código reconocido y estado válido. El evento es constante; no se pasan al logger el mensaje crudo ni el objeto `error`. `lib/directus/logger.ts` conserva su nivel configurado y filtro de datos; `types/shared/logger/log-context.ts` ya no permite `message` ni `details`; el logger descarta cualquier texto libre, incluso en `debug`. `Logger` expone `debug`, `info`, `warn` y `error` en `types/shared/logger/logger.ts`.
- El logger filtra por severidad, aplica un throttle de 60 s por clave de ubicación/mensaje/código salvo en `debug`, y usa `performance.now()` en lugar de reloj de pared, necesario con Cache Components. Ese throttle puede ocultar fallos repetidos de distintos usuarios; es un riesgo a evaluar, no una razón para romperlo sin una prueba.
- Las consultas públicas llaman `returnDirectusQueryError` y algunas convierten el fallo en `[]` o `null` (por ejemplo `services/domain/db/queries/collections/clients/clients.ts`); el formulario existente usa `next-safe-action` y muestra errores por campo en `components/blocks/content/form/FormClient.tsx` y `FormView.tsx`. `i18n/messages/es/db.json` ya contiene mensajes por recurso como `failed_to_fetch` y `not_found`. No existe todavía un contrato de error privado para órdenes.

## Contrato propuesto: acción y mensaje, no texto crudo

Clasificar en el servidor usando `isDirectusError`, **todos** los `errors[]` pertinentes y `response.status` como contexto; nunca analizar `message` para decidir una categoría. Un mismo incidente puede incluir varios códigos: establecer prioridad explícita para no mostrar una validación parcial si también falló la autorización. Propuesta de prioridad: sesión/identidad → denegación/no visible → indisponibilidad → validación → fallback. El status ayuda cuando no hay código, pero no debe convertir automáticamente cualquier 403 en «recurso existente pero prohibido».

| Categoría / clave i18n propuesta | Códigos oficiales orientativos | Respuesta segura / acción |
| --- | --- | --- |
| `directusErrors.sessionExpired` | `TOKEN_EXPIRED` | Intentar renovación **solo si** el flujo de sesión se demuestra seguro; si falla, pedir ingreso. No renovar en bucle ni repetir una mutación no idempotente. |
| `directusErrors.signInFailed` | `INVALID_CREDENTIALS`, `INVALID_OTP` durante login | Mensaje genérico de ingreso; sin confirmar existencia de la cuenta. |
| `directusErrors.sessionInvalid` | `INVALID_TOKEN`, `USER_SUSPENDED`, `INVALID_IP`, `INVALID_PROVIDER` | Cerrar o rechazar la sesión según la operación; no tratarlo como `FORBIDDEN` de una orden. |
| `directusErrors.accessDenied` | `FORBIDDEN`, `COLLECTION_INACTIVE` | Informar denegación sin revelar si existe el registro. Para acceso directo a un ID, mismo aspecto público de «no disponible» si es necesario evitar enumeración. |
| `directusErrors.validationFailed` | `FAILED_VALIDATION`, `INVALID_PAYLOAD`, `INVALID_FOREIGN_KEY`, `NOT_NULL_VIOLATION`, `RECORD_NOT_UNIQUE`, `VALUE_OUT_OF_RANGE`, `VALUE_TOO_LONG`, `UNPROCESSABLE_CONTENT` | Mostrar corrección de formulario y error por campo **solo** con nombres de campos permitidos y mensajes propios. No reflejar `value`, `reason` ni `message` crudos. |
| `directusErrors.rateLimited` | `REQUESTS_EXCEEDED`, `EMAIL_LIMIT_EXCEEDED` | Pedir que espere; no reintentar automáticamente una escritura. |
| `directusErrors.unavailable` | `SERVICE_UNAVAILABLE`, `UNEXPECTED_RESPONSE`, `OUT_OF_DATE`, `INVALID_PROVIDER_CONFIG`, `OUT_OF_TIME`, fallos de red/timeout y 5xx | Informar indisponibilidad, sin afirmar que la sesión caducó ni que una escritura fallida fue revertida. |
| `directusErrors.generic` | Código nuevo o sin clasificación | Mensaje seguro; registrar solamente metadatos permitidos. |

Otros códigos oficiales (`CONTENT_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `INVALID_PATH_PARAMETER`, `INVALID_QUERY`, `LIMIT_EXCEEDED`, `METHOD_NOT_ALLOWED`, `ROUTE_NOT_FOUND`, `GRAPHQL_*`, `ILLEGAL_ASSET_TRANSFORMATION`, `RANGE_NOT_SATISFIABLE`, `CONTAINS_NULL_VALUES`, `INVALID_INVITE`, `INVALID_METADATA`, `LICENSE_INVALID`) requieren mensajes específicos **solo si** el flujo afectado ofrece una acción útil; de lo contrario, fallback seguro y diagnóstico estructurado. No traducir mecánicamente cada texto inglés de Directus. Los Flows de inventario merecen contrato propio después de definir códigos de error y efectos de transacciones: no asumir que un fallo significa «no se descontó stock».

**Diferenciar estados observables:** colección vacía después de consulta exitosa ≠ `FORBIDDEN`; registro no visible ≠ sesión caducada; falta de dato requerido en un PDF ≠ fallo de red. La vista debe ofrecer siguiente acción pertinente (corregir, ingresar, reintentar manualmente o pedir acceso) y no prometer existencia del elemento. No exponer al navegador el error SDK, `response`, payload, cookies ni token.

**Textos de partida para el catálogo español (por validar con UX):**

- `sessionExpired`: «Tu sesión venció. Volvé a ingresar.»
- `signInFailed`: «No pudimos iniciar sesión con esos datos.»
- `sessionInvalid`: «No pudimos validar tu acceso. Volvé a ingresar.»
- `accessDenied`: «No tenés permiso para realizar esta acción.» En detalle por ID, considerar «La orden no está disponible.» sin confirmar su existencia.
- `validationFailed`: «Revisá los datos señalados e intentá de nuevo.»
- `rateLimited`: «Hubo demasiados intentos. Esperá un momento antes de volver a intentar.»
- `unavailable`: «El servicio no está disponible en este momento. Intentá más tarde.»
- `generic`: «No pudimos completar la operación. Intentá de nuevo.»
- `resultUnknown` para escritura de resultado incierto: «No pudimos confirmar si se guardó la operación. Verificá su estado antes de intentarlo nuevamente.»

## Logger: límite de información

1. Preservar el API de `Logger` y el filtrado por severidad; conservar `performance.now()` en código alcanzable por prerender. No cambiar la salida pública inadvertidamente.
2. Sustituir el transporte del error crudo (`context.message`, `context.details`) por un contexto permitido explícitamente: componente/operación/colección conocidas, código validado, estado numérico y, si hace falta correlación, un identificador opaco generado por la aplicación. No registrar IDs de órdenes, usuarios, correos, firmas, precios, cuerpos, cabeceras, URLs con credenciales ni `error.response`/`error.data`, **incluso en debug**. No suponer que un código personalizado de Flow es seguro para imprimir sin validarlo.
3. Separar severidad operativa de categoría visible: 403 esperado puede ser `warn`; indisponibilidad y errores internos, `error`; un 400 de formulario no necesariamente amerita error del servidor. Mantener la distinción 403 `LIMIT_EXCEEDED` frente a 429 `REQUESTS_EXCEEDED`.
4. Evaluar el throttle con concurrencia: comprobar si su clave agrupa eventos de usuarios distintos y si esto impide detectar fallas. Decidir entre mantenerlo con conteo agregado, excluir errores relevantes o cambiar clave **sin** introducir identificadores sensibles. No cambiarlo sin una prueba de comportamiento previo.
5. Respetar el contrato de Next.js con Cache Components: no `Date.now()` ni `new Date()` en las rutas del logger que puedan ejecutarse durante prerender (`.cursor/rules/cache-components-no-wall-clock.mdc`).

## Secuencia de implementación propuesta

1. T3 añadió pruebas deterministas de prioridad, errores SDK malformados y múltiples, errores anidados de ofetch, estados HTTP, transporte, códigos Flow desconocidos, ambigüedad de mutación y preservación de `void`/severidad; las pruebas de clasificador y query-error pasan junto con las pruebas del logger y trazado.
2. T1 eliminó el transporte de datos crudos y T2 instrumentó inicio/resultado de cada solicitud real mediante `globals.fetch` del cliente SDK compartido; la caché de Next.js no genera una solicitud ni traza. T3 implementó el clasificador de servidor y el catálogo `directusErrors` ensamblado por `i18n/request.ts`. Conectar este contrato a formularios/lecturas privadas sigue pendiente hasta que existan esos flujos; no mover el cliente público a un singleton de sesión.
3. Verificar que los consumidores públicos conservan su salida (salvo una decisión explícita de corregir el fallback), que el logger no emite datos sensibles ni en `debug`, y que la UI diferencia éxito vacío, sesión inválida, denegación, validación e indisponibilidad.
4. Antes de terminar **una modificación de código**, ejecutar `pnpm pre-deploy` conforme a `AGENTS.md`; la verificación con cuentas y permisos reales requiere autorización separada. No usar un entorno productivo ni registrar secretos para probar el error.

## Decisiones aún abiertas

- **Alcance inmediato (resuelto en T3):** la redacción segura se aplica también al logger de consultas públicas sin alterar los valores retornados por los repositorios públicos. El logger no recibe errores ni mensajes crudos desde `returnDirectusQueryError`.
- **Flujos y escrituras:** definir si una escritura que termina en timeout o respuesta ambigua se comprobará mediante lectura autorizada antes de permitir reintento; es indispensable para el pago y el inventario, no se resuelve con un mensaje i18n.
- **Mensajes visibles:** acordar la redacción exacta y si el producto presenta «acceso denegado» o «orden no disponible» al pedir por ID una orden no visible, respetando el ocultamiento de existencia.

## Fuentes y límites de investigación

- Directus: [Errores, códigos y SDK](https://directus.com/docs/guides/connect/errors), [guía del SDK](https://directus.com/docs/guides/connect/sdk).
- Código local: `lib/directus/logger.ts`, `lib/directus/query-error.ts`, `types/shared/logger/{logger,log-context}.ts`, `i18n/messages/es/db.json` y los consumidores de `services/domain/db/queries/`.
- No se leyeron registros, usuarios, políticas, datos privados ni secretos; no se ejecutaron pruebas ni se modificó código. El SDK instalado y la documentación publicada se contrastaron, pero **no** se verificó la versión/configuración del servidor ni la forma exacta de errores emitidos por sus Flows.
