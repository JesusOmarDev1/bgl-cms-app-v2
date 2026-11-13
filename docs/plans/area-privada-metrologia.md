# Plan para el área privada de metrología

Estado (2026-11-12): Batch 0 **aprobado por el usuario** (contrato en [area-privada-metrologia-batch-0.md](area-privada-metrologia-batch-0.md)). Batch 1 está **implementado y verificado localmente** (suite, typecheck, ESLint, Prettier; verificación independiente en copia aislada), pero **no cerrado**: faltan el Experimento 1 y el A/B integrado que ejecuta el usuario en su entorno aislado, más las validaciones de despliegue (XFF y rate-limit de Directus). El usuario autorizó e inició el **Batch 2**, que está **implementado y verificado localmente** (shell, dashboard, configuración y perfil con avatar; detalle en §3.0): falta su **revisión visual con sesión real** para cerrarlo. El detalle de Batch 1 está en §3.0 y en Batch 1 (§4); el de Batch 2, en el bloque homónimo de §3.0 y en Batch 2 (§4). Batches 3–9 no autorizados; Batch 10 opcional. Una validación de cantidad ya aplicada con autorización al Flow activo se describe en §2; sus pruebas end-to-end y propiedades de atomicidad siguen sin verificarse. El plan separado de errores/logger se menciona como antecedente, pero `docs/plans/directus-errors-logger.md` no existe en este árbol: no dar por disponible su contrato ni recrearlo sin pedido.
Alcance: área privada para gestionar órdenes de servicio y las colecciones que realmente facilitan ese trabajo, mediante permisos individuales efectivos. `traceable` y `accredited` se evalúan después; `consecutives` permanece excluida.

**Lectura rápida:** el esquema vivo confirma `order`, `order_scales`, `scales`, `clients`, `inventory` e `inventory_movements`; `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). El usuario informó que aún no había órdenes al momento de la conversación; no se consultaron registros. El modelo de líneas de refacciones, `scales.client` y el vínculo de movimientos a órdenes siguen sin crearse. `inventory.price` es decimal(10,2), nullable, default `NULL`. Las decisiones de producto y UI confirmadas están abajo, incluida la obligatoriedad futura de `supplier` para todo `entry` y `client` para todo `withdrawal`, independientemente de `status`. La forma técnica de garantizar transiciones, atomicidad, idempotencia y concurrencia no está demostrada. No se verificaron permisos efectivos, enforcement API, rollback integral, historial de firmas ni integración del PDF privado. El prototipo PDF sí se renderizó en navegador dentro de Storybook con datos sintéticos; eso no prueba descarga de órdenes reales.

### Decisiones confirmadas (fuente: conversación con el usuario)

- **Regla transversal a documentos:** su contenido solo se puede editar cuando el documento está en `draft`. Desde cualquier otro estado se puede volver a `draft` mediante un cambio explícito si la persona tiene permiso; mientras tanto, la edición de contenido sigue bloqueada. Esto no presupone que `traceable` o `accredited` ya tengan campo de estado: todavía no lo tienen en el esquema consultado, y su diseño queda para más adelante.
- Next.js + SDK oficial de Directus, sesión por persona; Directus gobierna permisos de filas/campos/operaciones. El usuario administra roles y políticas; no codificar el rol «Técnico» ni usar el token público para operaciones privadas. Sin registro público.
- CRUD de órdenes y colecciones útiles para gestionarlas (clientes, básculas, inventario y movimientos, entre otras según tareas concretas), más perfil propio; una colección nueva no implica necesariamente una pantalla propia. Personal no puede borrar físicamente ningún registro del área privada, incluidos movimientos. Solo una persona administradora con permisos efectivos de Directus puede hacer borrados físicos excepcionales. Personal con permiso efectivo de edición sí puede editar movimientos manualmente; la corrección ordinaria es compensatoria. La conciliación y sus bloqueos se especifican en §3.9, pero su implementación técnica aún no está probada.
- `scales` representa básculas de clientes; `inventory.type = equipments` representa existencias y no debe confundirse con esas básculas. Se necesita una relación `scales.client → clients`, **opcional para los registros ya existentes**: una báscula sin cliente no aparece en el selector. No inferir dueño a partir de órdenes históricas.
- En el editor de orden, elegir cliente filtra las básculas disponibles. Si se cambia el cliente con básculas seleccionadas, conservarlas y señalarlas como incompatibles en el borrador; bloquear el guardado (y no presentar un PDF válido de esa combinación) hasta quitarlas/reemplazarlas o restaurar el cliente previo. Revalidar todas las relaciones al guardar, sin cambios parciales.
- En el detalle de una orden, mostrar el preview a la izquierda; «Editar» abajo a la derecha abre desde la derecha un panel con el formulario (drawer accesible en móvil). La barra superior ofrece únicamente Descargar PDF, Compartir y Abrir PDF en nueva pestaña. PDF actual en memoria, sin almacenarlo en Directus. Los valores no monetarios disponibles aparecen por defecto; todos los valores monetarios se ocultan por defecto, con controles individuales y «ocultar todos los precios» por descarga, sin persistir visibilidad. El PDF siempre muestra estado discreto; el watermark CANCELADA es opcional. La imagen `C:\Users\benog\Downloads\order.jpg` es referencia visual y puede no estar en otro equipo; hay ocho logos WebP en `assets/logos/pdf`.
- `order.folio` es UUID, **no** un consecutivo numérico. Para cualquier guardado, sin importar estado, deben estar presentes todos los campos requeridos de la orden, incluidas ambas firmas, y al menos una báscula; cero refacciones sí es válido. `description` es un texto general de servicio compartido por todas las básculas. `order.date_created` es la fecha que se imprime; nombre del receptor y departamento se capturan manualmente en los campos existentes. Estos requisitos de producto no prueban que la API actual los imponga.
- `inventory.price` es decimal(10,2), nullable, default `NULL`; no se requiere en la UI del inventario y se usa el precio actual (sin snapshot histórico), en MXN con dos decimales. No hay descuentos. IVA opcional de 16% se elige y guarda por orden, separado de ocultar valores en cada descarga. Una línea por artículo, cantidad entera positiva; el modelo sigue propuesto, no creado. Una orden puede pagarse sin refacciones, cargos ni precios. Si una fila carece de precio, su importe y subtotal/IVA/total derivados quedan en blanco, no sumas parciales; las existencias de partes incluidas sí se descuentan al pagar.
- `order.status` existe con valores `draft`, `paid`, `cancelled`, default `draft` y columna `NOT NULL`. Se permiten `draft → cancelled`, `cancelled → draft`, `paid → draft`, `paid → cancelled` y directamente `cancelled → paid`. `draft → paid` confirma el pago. Editar contenido solo en `draft`; reabrir una pagada conserva los movimientos de su último pago confirmado. Repagar concilia el delta respecto a ese baseline; cancelar una pagada compensa el neto. `cancelled → paid` concilia desde el neto efectivamente atribuido a la orden. No se borra físicamente ninguna orden por personal. El historial de cancelación ya existe según el usuario; no duplicarlo. No se autoriza modificar Directus en este plan.

## 1. Veredicto de viabilidad

**La arquitectura parece viable con dependencias instaladas**, sin agregar una biblioteca de autenticación ni un servicio externo de PDF; esto no prueba viabilidad de las reglas de órdenes ni su enforcement técnico.

La propuesta mínima es:

- Next.js como intermediario entre el navegador y Directus.
- Autenticación individual con el SDK oficial de Directus.
- Sesión mediante cookies `HttpOnly`, con modo y responsable de emisión por decidir tras una prueba de integración.
- Autorización efectiva en Directus para cada consulta, con credenciales individuales del empleado.
- CRUD de órdenes y recursos relacionados por etapas, sin duplicar colecciones de Directus ni permisos en Next.js.
- Editor de orden y propuesta preferida de PDF generado en el navegador con Forme y componentes pdfcn locales: el renderizado funciona en el prototipo aislado de Storybook con datos sintéticos, no se ha integrado en la aplicación privada. Cada descarga requiere reautorización y lectura de la versión guardada en el servidor. El PDF no se sube a Directus; la integración de firmas con `directus_files` se valida aparte.
- Navegación interna inspirada en shadcn/ui, adaptada a los componentes React Aria existentes y a las tareas efectivamente disponibles.

**La viabilidad está condicionada a verificar políticas y sesiones reales.** Los metadatos remotos descritos abajo son evidencia histórica de una consulta autorizada, **no** una nueva lectura de la instancia en esta reevaluación; revalidar únicamente los metadatos pertinentes al preparar una migración y pedir el permiso concreto antes de cualquier acceso. Una consulta posterior, autorizada expresamente por el usuario, confirmó mediante el MCP de Directus la existencia y el esquema de `order`, `traceable` y `accredited`. No se encontró snapshot local ni soporte tipado o consultas de metrología en Next.js; eso es una carencia del frontend, no del servidor.

La investigación original fue local y de solo lectura. En la revisión posterior se consultaron metadatos (`schema`, `fields`, `relations`, `collections`) sin leer registros, usuarios, políticas, archivos ni secretos; posteriormente, con autorización explícita, se actualizó la validación de cantidad del Flow existente y se confirmó la configuración por lectura posterior. Al comenzar esta reevaluación el árbol local estaba limpio (`main`); las descripciones de cambios ajenos pertenecen a una sesión anterior y no prueban el estado actual de otro equipo. Esta edición solo actualiza el plan solicitado.

Las referencias a líneas reflejan el estado inspeccionado y pueden desplazarse con cambios posteriores.

## 2. Hallazgos verificados

### Cliente Directus y consultas actuales

El cliente público, hoy en `config/directus-public.ts` (antes `config/directus.ts`):

- Es exclusivamente de servidor.
- Usa `createDirectus<Schema>()`, `staticToken()` y `rest()`.
- Obtiene URL y token de variables de entorno.
- Aplica un timeout de diez segundos.

Los nombres de esas variables están en `lib/env/constants.ts:1-5`. Se leyeron las referencias del código, no los valores de `.env`.

Ese cliente abastece consultas públicas de páginas, productos, clientes, navegación y otros recursos. Por ejemplo, `services/domain/db/queries/collections/clients/clients.ts:21-33` utiliza `"use cache"` y una vida de caché de minutos.

**Consecuencia:** preservar el comportamiento del cliente público de `config/directus-public.ts` y sus consumidores. Crear el cliente de `config/directus-private.ts` por solicitud con el access token del empleado; no exportar un singleton autenticado. No llamar `setToken()` sobre el cliente público: mezclaría credenciales entre solicitudes y podría alterar el sitio. El usuario eligió `json` para login/refresh/logout; nunca usar el token público en el área privada.

Se puede reutilizar el patrón de archivos `*.fields.ts`, consultas y repositorios, pero **no copiar su caché compartida ni convertir errores privados en listas vacías**. El documento separado de errores/logger al que se refería el plan no está en este árbol; concretar fallos seguros y mensajes usados dentro de los batches correspondientes, sin asumir que aquel trabajo se implementó.

### Versiones reales

Las versiones instaladas verificadas en esta reevaluación son:

- Next.js **16.4.6** (bump aplicado directamente por el usuario en `package.json` y `pnpm-lock.yaml`; los cambios de dependencias y su commit los gestiona él; el dato histórico 16.4.2/16.4.5 quedó obsoleto).
- SDK de Directus **24.0.0**.
- `@formepdf/core` y `@formepdf/react` **0.25.0**.

Evidencia: `node_modules/next/package.json:1-3`, `node_modules/@directus/sdk/package.json:1-3` y los `package.json` de ambos paquetes Forme.

`next.config.ts:9-10` habilita **Cache Components y Partial Prefetching**. Por eso no corresponde trasladar ejemplos de autenticación de otras versiones sin adaptación.

### Colecciones: evidencia del servidor y ausencia de soporte local

**Verificado en el servidor mediante MCP de Directus (solo metadatos, sin lectura de registros):** existen `order`, `order_scales`, `scales`, `scales_files`, `traceable`, `accredited` y `consecutives`; `metrology` es una carpeta de agrupación de colecciones, no una tabla. `order`, `traceable` y `accredited` están agrupadas bajo ella. Esto **no** demuestra que una cuenta de empleado tenga permiso de lectura sobre ellas.

- `order`: `id` UUID; `folio` UUID con propiedad `uuid`, sin clave foránea declarada hacia `consecutives`; `description` (texto), `client_name` y `client_department` (texto). `client` apunta a `clients`; `technician_name` apunta a `directus_users`; `technician_signature` y `client_signature` apuntan a `directus_files`.
- `order.scales` es una relación **M2M** a `scales` mediante `order_scales` (`order_id`, `scales_id`, `sort`; ID entero en la unión). La relación tiene ordenamiento; no debe modelarse como una única báscula.
- `scales` tiene `capacity` y `division` (float), `units`, `title`, `status`, `brand` → `brands`, `model` → `models` (opcional), `identification`, `serial_number` e `images` → `directus_files` mediante `scales_files`. No se inspeccionaron las colecciones relacionadas en detalle.
- `traceable` y `accredited` muestran únicamente `id`, `sort` y campos de auditoría (`user_created`, `date_created`, `user_updated`, `date_updated`) en el esquema consultado: no hay evidencia de cálculos, relaciones ni datos de informe allí.
- **Integridad:** `client`, `description`, `folio`, `technician_name`, `client_name`, ambas firmas y el alias `scales` aparecen como `required` en metadatos de interfaz, pero las columnas físicas respectivas admiten `NULL`; el alias no es una columna física. Por decisión de producto, todos estos campos —incluidas ambas firmas— deben estar presentes en cualquier guardado, cualquiera que sea el estado, y debe haber al menos una báscula; cero líneas de refacciones es válido. No se puede guardar estado intermedio inválido para reparar identidad/firma. Esto no demuestra enforcement equivalente en API. `folio` es UUID y se imprime completo; no se sustituye por consecutivo.

La revisión de metadatos confirmó además `clients` (cliente con datos fiscales y de contacto), `inventory` (stock entero y `type` que incluye `spare_parts` y `equipments`), `inventory_movements` (relaciones a inventario, cliente y proveedor; `quantity` float) y catálogos `brands`, `models` y `suppliers`. **No** hay relación `scales.client` ni vínculo `inventory_movements.order`. `inventory.price` existe y fue verificado por metadatos como decimal(10,2), nullable y default `NULL`; no se exige en la UI. El usuario creó `order.status`: el MCP verificó campo string, opciones `draft`, `paid`, `cancelled`, UI `required`, columna `NOT NULL`, índice y default `draft`. El dropdown no impone por sí solo transiciones ni bloqueo de edición. La colección de líneas de orden sigue sin crearse. La cantidad de movimientos es float, mientras el stock es entero. Con autorización explícita, el Flow activo «Movimientos Inventario» fue actualizado para validar la cantidad nueva en create/update como entero positivo y rechazar decimal, null, booleano y arrays, preservando valores legados sin cambios en update/delete; la lectura posterior confirmó la configuración remota. El usuario informó una prueba satisfactoria, pero no aportó registros/logs ni stocks, por lo que no hay evidencia independiente de efectos de stock, rollback, atomicidad o concurrencia. Esa actualización es un cambio remoto ya realizado, no una autorización para modificar más Flows ahora.

En Next.js, `types/schema.ts:94-187` no incluye las colecciones metrológicas ni se encontraron tipos, consultas, repositorios o rutas de órdenes; tampoco un snapshot local de Directus. El trabajo es **incorporar soporte privado a Next.js y proponer únicamente cambios de esquema justificados**, sin duplicar `order` ni usar `consecutives`. Los tipos y consultas públicos de `clients` no incluyen datos sensibles ni sirven como contrato privado completo. `ServiceOrderData` ya existe en `components/pdf/templates/service-order.tsx`: es el contrato de presentación del PDF, **no** evidencia del esquema o los permisos de Directus.

### Rutas y separación público/privado

El layout raíz incluye cabecera pública, footer, botones flotantes y analítica alrededor de todas las páginas: `app/layout.tsx:59-89`.

Agregar únicamente un layout interno anidado **no elimina esos elementos**. La separación mínima sería:

- Mantener en `app/layout.tsx` el documento, fuentes, tema y proveedores realmente comunes.
- Llevar la composición visual pública a `app/(site)/layout.tsx`.
- Crear un grupo interno separado.
- Mantener las URL públicas existentes mediante route groups.

Hay que contemplar también las rutas fuera de `(site)`, como errores y mantenimiento, para no cambiar su presentación accidentalmente. El template público actual tiene un `MaintenanceGate`: `app/(site)/template.tsx:1-12`.

### Sidebar y diseño

`components.json:2-16` configura el estilo **`aria-nova`**. Los componentes locales usan React Aria:

- `components/ui/button.tsx:1-10`.
- `components/ui/sheet.tsx:1-19`.

Por eso los bloques de shadcn son una **referencia de composición**, no código para pegar sin adaptación: sus ejemplos pueden usar APIs distintas a las locales.

`DESIGN.md` exige tema oscuro, tokens existentes, `MaterialIcon`, componentes de `components/ui` y textos en los catálogos de next-intl. Además, `app/theme.css:106-113` conserva un `--sidebar-primary` cromático; conviene usar un estado activo neutral conforme a `DESIGN.md`, no adoptar ese color automáticamente.

### PDF disponible y límites reales

Ya existen componentes locales para texto, títulos, secciones, claves/valores, listas, tablas, encabezado, pie, numeración, QR, firmas y saltos de página.

Evidencia principal:

- Documento A4 de ejemplo: `components/pdf/example.tsx:1-15`.
- Primitivas Forme: `components/pdf/pdf-primitives.tsx:1-67`.
- Tabla: `components/pdf/table.tsx:17-27,169-171,229-262`.
- Firmas: `components/pdf/signature.tsx:10-40`.
- Numeración: `components/pdf/page-number.tsx:15-32,57-94`.

**No está instalado todo el catálogo de pdfcn.** La revisión actual encontró `components/pdf/pdf-image.tsx:40-61,122-184` y el componente local `components/pdf/data-table.tsx:21-135`. `DataTable` compone `Table`; `PdfImage` acepta URI y opcionalmente headers, pero eso **no** autoriza automáticamente la lectura de archivos privados. No se encontró un componente independiente `keep-together`. `PdfImage` sí se renderizó con PNG públicos en el prototipo de Storybook; `DataTable` no se validó allí.

La imagen aportada muestra fecha, datos del cliente, servicio, equipos, refacciones con precios/totales, firmas, logos y pie comercial. Es **referencia visual**, no autorización para inventar esos datos ni convertir su número decimal en el folio UUID. Los ocho logos WebP están en `assets/logos/pdf`; la imagen original está fuera del repositorio y debe volver a proporcionarse en otro equipo si se requiere comparar píxel a píxel.

Límites importantes:

- La tabla local usa `View`, no la tabla semántica nativa de Forme. No hay prueba de repetición automática de encabezados.
- Cada fila usa `wrap={false}` (`components/pdf/table.tsx:169-173`): una fila mayor que una página necesita tratamiento explícito; el nuevo `DataTable` no cambia esa limitación.
- `formatValue(null)` produce cadena vacía (`lib/pdf-themes/styles/data-table.styles.ts:45-55`): detectar datos requeridos nulos o denegados **antes** de generar un documento aparentemente completo.
- `PageNumber` declara `fixed`, pero su implementación no lo utiliza (`components/pdf/page-number.tsx:15-32,56-93`); para repetirlo hay que componerlo dentro de un pie fijo.
- El proveedor de tema mantiene una variable global mutable: `components/pdf/theme-provider.tsx:9,36-58`. No introducir temas por usuario; el MVP usaría un único tema y probaría renderizados concurrentes.

Existe un prototipo de orden de servicio aislado de la aplicación privada en `components/pdf/templates/service-order.tsx` y `stories/pdf/service-order.stories.tsx`, con variantes `filled` y `blank` y datos sintéticos. Forme renderizó PDFs en navegador dentro de Storybook; las imágenes se entregan a `PdfImage` como PNG (logos públicos, no firmas privadas), sin conversión WebP en tiempo de ejecución. La versión rasterizada con esas imágenes pesó aproximadamente 542 KB y conservó una página en el caso de referencia. La plantilla se separó en nueve secciones internas en `90a8328` (ahora incorporado en `main`) sin cambiar su API pública ni la composición visual de referencia; el pulido previo trasladó el espaciado al contenedor gris y ajustó los rótulos «Folio:» y «RECIBÍ EL TRABAJO A SATISFACCIÓN». Nada de esto constituye un flujo privado de generación/descarga con órdenes reales.

La cuarta fila de refacciones y su prueba de regresión de paginación ya están en `main` (integradas mediante `54daea0` y el merge `4d6ff01`), tanto para `filled` como para `blank`: 4 refacciones/1 báscula → 1 página; 5 refacciones → 2 páginas. La prueba falló antes del cambio y pasó después (2 stories en total); typecheck, lint focalizado, formato focalizado y build de Storybook pasaron. Los renders locales y la extracción de texto confirmaron las cuatro filas y la quinta en la página siguiente. El equipo revisado ya paginaba correctamente: se comprobaron casos de 1 a 5 básculas, dos bloques por página. Una rasterización de dos básculas/cuatro refacciones no cambió al simplificar el código de los bloques de equipo. La nueva fila comprimió la altura compartida de firmas/totales; se inspeccionó una muestra sintética con dos imágenes de firma sin solapamiento, pero queda riesgo de regresión en ese bloque. La **verificación independiente de la cuarta fila no terminó**: falló la preparación de un entorno aislado y ejecutó **0 pruebas**; la integración en `main` no sustituye esa prueba ni permite dar la verificación por cerrada. No se escribió en Directus para este prototipo.

### Estado actual de verificación

El avance previo del `DateRangePicker` tiene cuatro pruebas enfocadas que pasaron. Un typecheck anterior falló por errores no relacionados de módulos `pdf-theme` ausentes; no equivale al typecheck focalizado posterior que sí pasó para el prototipo. Storybook tuvo build y pruebas focalizadas satisfactorias, pero no hay verificación global completa ni build Next.js fresco en esta actualización documental; la ruta de órdenes aún no existe.

`pnpm pre-deploy` ejecuta **format con escritura y build** (`package.json:15`). No es compatible con esta investigación/actualización documental de alcance limitado.

## 3. Propuesta técnica mínima

### 3.0 Implementado en Batches 1 y 2 (fuente de verdad del código actual)

#### Batch 1 — sesión y cliente privado

**Clientes Directus.** `config/directus-public.ts` exporta el singleton `publicDirectus` (antes `config/directus.ts`; setup byte-idéntico: `staticToken` + `rest` + timeout 10 s + trace fetch) y alimenta las 31 consultas públicas. `config/directus-private.ts` no exporta singletons autenticados: `buildPrivateClient()` construye por llamada un cliente `authentication("json", { autoRefresh: false })` + `rest({ cache: "no-store", signal: options.signal ?? AbortSignal.timeout(DIRECTUS_TIMEOUT_MS) })`; sobre él, `createPrivateDirectus(accessToken)` (rechaza token vacío, hace `await setToken`) para lecturas privadas y `createDirectusAuthClient()` (sin token) para login/refresh/logout.

**Sesión.** `services/domain/server/auth/session.ts`: cookies propias `bgl_auth_access` y `bgl_auth_refresh` (`HttpOnly`, `Secure` en producción, `lax`, `path: "/"`, sin `Domain`); access con `maxAge` derivado de `expires` de Directus, refresh fijo 7 días (`AUTH_REFRESH_COOKIE_MAX_AGE`, anotado como shortcut hasta confirmar TTL real del despliegue). `readAuthSession()` lee ambas cookies; `createSessionClient(accessToken)` construye el cliente privado; `applyAuthCookies` exige ambos tokens y solo corre en Server Actions/Route Handlers; `clearAuthCookies` borra ambas.

**Server Actions de auth** (`login.ts`, `refresh.ts`, `logout.ts`, todas `"use server"` + next-safe-action + valibot):

- **Login:** rate-limit por IP (`loginLimiter` en `config/rate-limiter.ts`, 5/60 s con bloqueo 300 s y insurance en memoria; fail-closed si el `x-forwarded-for` es multi-hop, con mensaje de indisponibilidad, no de rate-limit). SDK `login({ email, password }, { mode: "json", otp })`; MFA: sin OTP → `mfaRequired`, OTP inválida → `mfaInvalid`. Gate de rol: `readMe({ fields: ["id", "role"] })` rechaza cuentas sin rol con `noRole` **antes de emitir cookies**. Solo entonces `applyAuthCookies`.
- **Refresh:** single-flight por proceso (`pendingRefreshes` map por refresh_token, promesa compartida, limpieza en `finally`). Comando crudo `refresh({ mode: "json", refresh_token })` — la extensión `authentication()` del SDK **ignora** el refresh_token de options y lee su propio storage, por eso no se usa. Clasificación: sesión vencida/inválida → borra cookies y pide login; error de Directus transitorio (p. ej. 503) → conserva cookies e informa indisponibilidad; sin sesión → 0 fetch y `sessionExpired`.
- **Logout:** comando crudo `logout({ mode: "json", refresh_token })` revoca en Directus; borra cookies locales siempre; si Directus falla, cierra localmente con `remoteRevoked: false` (nunca afirma revocación confirmada).
- **Contrato de errores estable:** las acciones devuelven **claves** (`invalidCredentials`, `mfaRequired`, `mfaInvalid`, `noRole`, `rateLimited`, `unavailable`, `generic`, `sessionExpired`), nunca texto traducido; la traducción ocurre solo en el cliente (`auth.json` + `directusErrors`). Los mocks de next-intl en tests devuelven `T:<key>` para que un bug de doble traducción (MISSING_MESSAGE, ya ocurrido) no vuelva a pasar. `classifyDirectusError` (lib/directus/classify-error.ts) mapea códigos SDK a categorías.

**Rutas y layouts.** Root layout sin chrome público; `(site)`/`(http)`/mantenimiento usan `PublicSite`; el área privada vive en el grupo `(auth)`: `/login` (metadata noindex) y `/dashboard` (SessionCard dentro de `<Suspense>`, redirect a `/login` sin sesión, identity vía `getIdentityRepository` — patrón casa: `types/collections/session.ts`, query + `session.fields.ts` y repositorio; sin SDK en la página, sin `"use cache"` en datos privados). `AuthPage` usa TanStack Form + valibot, `PasswordInput` (InputGroup + toggle con `LazyMotion`/`m`), `InputOTP`, `MaterialIcon`; `RefreshSession` y `LogoutButton` componentes cliente.

**Hardening aplicado:** `onRequest` preserva el `signal` del llamador; `request-trace` registra 4xx a `debug` y 5xx/transporte a `info`, sin headers ni cuerpos.

**Verificación:** suite 87/87 (22 archivos), `tsc` limpio, ESLint sin errores, Prettier, `git diff --check` (solo EOL). Verificación independiente en copia aislada: 70/70 + typecheck (la preparación falló 3 veces copiando `node_modules`; la solución fue copiar solo el árbol fuente + junction de `node_modules`, sin red; scratch eliminado). **No commits del asistente: los sube el usuario.**

**Lecciones aprendidas (aplicar en Batches 3+):**

1. La extensión `authentication()` del SDK v24 guarda tokens en su propio storage y `refresh()`/`logout()` ignoran opciones: usar siempre los comandos crudos con `{ mode: "json", refresh_token }` explícito.
2. Un import de módulo inexistente en Vitest no falla al importar: el síntoma es «unavailable» con 0 fetch — diagnosticar por conteo de llamadas.
3. Las Server Actions devuelven claves de error, no texto; traducir en cliente. Mocks de i18n con prefijo (`T:`) para detectar doble traducción.
4. Las copias aisladas para verificación independiente: solo árbol fuente + junction de `node_modules`; nunca copiar `node_modules` (timeout 240 s).
5. El usuario edita el árbol en paralelo: releer cada archivo antes de editarlo.
6. Patrón casa obligatorio: tipos en `/types`, `*.fields.ts` + query + repositorio, sin SDK inline en la app; `use cache`/`cacheTag`/`cacheLife` solo para datos públicos.
7. `REQUESTS_EXCEEDED` de Directus ya llega clasificado como `rateLimited`: segunda capa tras el limiter local.
8. React Aria: cualquier hijo que no sea `Tab` dentro de `TabList` rompe la colección (TabList renderiza vacío); `next/link` en `render` dispara «Expected <button>, got <a>» — usar el `href` nativo de `SidebarMenuButton` + `RouterProvider` para navegación SPA; el wrapper de tooltip debe pasar `isDisabled` al `Focusable`.
9. `next/image` con URLs `blob:`/`data:` necesita `unoptimized` (el optimizador rechaza esos esquemas con 400); `new Image()` choca con el import de `next/image` — usar `new window.Image()`.
10. Insight de Cache Components `blocking-prerender-current-time` (`Date.now()`): resolver con `await connection()` al inicio del hijo de `<Suspense>`, no eliminando la lectura de tiempo.
11. Con cookies de prueba (sin sesión real) la identidad privada es `null` a propósito: la UI autenticada (perfil, avatar, recorte) solo se verifica visualmente con sesión del usuario.

#### Batch 2 — shell, dashboard y configuración

**Shell y navegación.** `app/(auth)/(dashboard)/layout.tsx`: shell privado con `SidebarProvider` + `AppSidebar` + header h-12 con `SidebarTrigger` (`aria-label` en español) y `ThemeToggle`; la identidad se resuelve en `SidebarUser` (async, dentro de `<Suspense>` con fallback de esqueleto; redirect a `/login` sin sesión) y no en el top-level del layout. `components/blocks/app/AppSidebar.tsx` (client, `RouterProvider` de RAC para navegación SPA): marca con `StaticLogo` + nombre real de la app, grupos **Operación** (Panel `/dashboard` activo; Órdenes y Movimientos deshabilitados hasta su batch, con tooltip «Disponible próximamente») y **Catálogos** (Clientes, Básculas, Inventario, Marcas, Modelos, Proveedores, deshabilitados), `SidebarMenuButton` con `href` nativo y `aria-current` en el activo. Menú de usuario en el pie del sidebar: avatar con fallback de iniciales, nombre/email, enlace a Configuración y Cerrar sesión (Server Action `logout`, redirect a `/login` al confirmar). **Sin bloques Efferd instalados:** composición propia con `components/ui/sidebar.tsx` y componentes locales; el texto «Área privada» se eliminó de la UI por pedido del usuario.

**Dashboard.** `/dashboard` (`SessionCard`): `await connection()` (fix del insight `blocking-prerender-current-time` por `Date.now()`), `<Suspense>` + esqueleto, identidad vía `getIdentityRepository` con degradación explícita (avatar, nombre, cargo, email, último acceso formateado con `Intl.DateTimeFormat` hoistado), `RefreshSession` y `LogoutButton`.

**Configuración.** `/dashboard/configuracion` (noindex): Tabs verticales a la izquierda (`orientation="vertical"`, variante `line`) y contenido a la derecha; **Apariencia**: tamaño de fuente Pequeño/Predeterminado/Grande (control segmentado con `ui/tabs`, selección con tokens, sin rojo) y movimiento reducido (`ui/switch`), preferencias guardadas solo en el dispositivo (`localStorage "private-settings"`, `data-font-size`/`data-motion` en `<html>`; `prefers-reduced-motion` respetado antes de una elección local; shortcut anotado: flash breve del default). **Perfil**: encabezado de identidad (avatar 64 px, nombre, cargo, email, nota de solo lectura) + formulario en grilla de dos columnas (nombre+apellido, cargo+ubicación; descripción y etiquetas a ancho completo) con TanStack Form + valibot y botón Guardar deshabilitado sin cambios (dirty por snapshot serializado). **Foto de perfil**: `UploadAvatar` (arrastrar/soltar, recorte circular en canvas 320×320, rotación, `dataURL→File` con `atob`/`Uint8Array` sin `fetch`) que llama la Server Action `uploadAvatar` (valida ≤2 MB y `image/*`, sube a `directus_files` y hace PATCH de `avatar`; errores como claves `photo*`/`directusErrors`). El avatar se muestra con `DirectusImage` y la relación anidada `{ avatar: ["id", "type", "width", "height"] }`: asset público por UUID (decisión del usuario en Batch 2), sin token en el DOM.

**Capa de dominio de sesión.** `types/collections/session.ts`, `services/domain/db/queries/collections/session/{session.fields,session}.ts` y `services/domain/db/repositories/collections/session.ts`: identidad con avatar, `location`, `description` y `tags`; sin `use cache` (privado); sin SDK en componentes ni páginas; normalización defensiva de la relación avatar (el SDK la amplía a string|file).

**Server Action de perfil.** `services/domain/server/auth/profile.ts`: `updateProfile` (nombre, apellido, título, ubicación, descripción, etiquetas; trim y límites; cadena vacía limpia el campo; etiquetas por comas → array limpio, >20 etiquetas o alguna >50 caracteres → `validationFailed` sin llamar a Directus) y `uploadAvatar`; re-verificación de sesión dentro de cada acción y errores como claves estables (`sessionExpired`, `accessDenied`, `validationFailed`, `generic`, `unavailable`) vía `classifyDirectusError`. Tests con mocks de la acción (14/14 en `profile.test.ts`).

**Verificación Batch 2:** suite 101/101 (23 archivos), `tsc` limpio, ESLint sin errores, Prettier, `git diff --check`; verificación visual con Playwright (tabs verticales, cambio de pestaña, 0 errores de consola propios) y capturas en `odd/evidence/`. **Pendiente del usuario:** revisión visual con sesión real (perfil, avatar y recorte) para cerrar el batch.

### 3.1 Autenticación: JSON elegido e implementado; pendiente de prueba integrada

**Decisión del usuario para Batch 1: modo `json`, definitivo para dominios distintos.** La [API oficial](https://directus.com/docs/api/authentication) documenta que el refresh token se devuelve en la respuesta JSON, y la documentación de Single Sign-On lo confirma para este despliegue: cookies solo alcanzan subdominios del mismo dominio padre; con dominios de segundo nivel distintos "each domain will maintain its own independent session" ([Cookie Limitations](https://directus.com/docs/configuration/auth-sso)). `SameSite=None` es un ajuste de borde (default `lax`) que solo agregaría CSRF y riesgo de bloqueo por third-party cookies: **`session`/`cookie` de Directus quedan descartados**, no solo diferidos. Que los tokens lleguen a Next.js no implica entregarlos al JavaScript del navegador, pero obliga a custodiar y rotar access y refresh tokens correctamente. La documentación no prueba por sí sola las carreras de refresh ni los permisos efectivos en el despliegue.

Comparación de modos (elección cerrada; referencia para el historial de decisión):

- **JSON:** devuelve access token, refresh token y duración. Next.js controla sus cookies del mismo origen y usa el access token en las consultas del empleado.
- **`session`:** Directus emite una cookie con un token que combina acceso y renovación. **Descartado:** esa cookie nunca llegaría al dominio de Next.js (dominios de segundo nivel distintos) y forzarla con `SameSite=None` agrega CSRF y bloqueo de third-party cookies.
- **`cookie` no es sinónimo de `session`:** es otro modo, asociado al refresh token en cookie; mismo descarte.

**Implementación:** usar `json` sin depender de una cookie emitida por Directus en otro dominio. Probar respuestas de refresh fuera de orden en varias pestañas e instancias; si no se demuestra renovación segura, cerrar sesión al vencer el acceso y pedir nuevo login, sin prometer renovación transparente.

Fuentes:

- [Tokens y cookies de Directus](https://directus.com/docs/guides/auth/tokens-cookies).
- [SDK oficial de Directus](https://directus.com/docs/guides/connect/sdk).
- [Autenticación Next.js: sección JSON solicitada](https://directus.com/docs/frameworks/nextjs/authentication#json-authentication-mode).
- [Cookie Limitations (auth-sso)](https://directus.com/docs/configuration/auth-sso) — cookie no cruza dominios de segundo nivel distintos.

**No copiar literalmente el tutorial:** utiliza un cliente global mutable, registra respuestas de login y muestra un logout que solo borra una cookie. No constituye por sí solo una solución completa para producción.

### 3.2 Ciclo de sesión

Login, logout y refresh son operaciones POST en Server Actions separadas: `services/domain/server/auth/login.ts`, `logout.ts` y `refresh.ts`. Cada módulo usa `"use server"` y el SDK oficial de Directus, siguiendo `services/domain/server/form/submit-form.ts`. Reutilizar `components/shared/auth/AuthPage.tsx` como pantalla existente: su formulario actual es visual y el botón de ingreso no ejecuta autenticación; conectarlo al flujo verificado, no crear otro login. No crear Route Handlers por colección ni duplicar lógica de autenticación; compartir únicamente un helper real de credenciales/cookies por solicitud si hace falta. Login valida credenciales e ingreso al área; refresh y logout validan la sesión correspondiente. Todas aplican protección CSRF/origen según corresponda, respetan MFA cuando aplique, devuelven errores redactados y nunca aceptan autoridad/permisos enviados por el navegador.

1. **Login**
   - Formulario accesible, validación en servidor y mensajes genéricos para no revelar cuentas.
   - SDK `login(..., { mode: "json" })` conforme a la elección del usuario.
   - Cliente sin estado de autenticación compartido.
   - Respetar MFA si las cuentas lo requieren; no inventar un mecanismo alternativo.
   - Validar ingreso al área antes de establecer la sesión definitiva.

2. **Cookies**
   - En JSON, **dos cookies propias de Next.js**: `access` (vida corta) y `refresh` (largavida), ambas `HttpOnly`, `Secure` en producción, `sameSite: "lax"`, `path: "/"` y **sin atributo `Domain`** — cookies del mismo origen, nunca reenviadas a Directus ni bajadas al cliente.
   - Emisionidas **solo en Server Actions o Route Handlers**; nunca durante el render de un Server Component (HTTP no permite encabezados tras el streaming).
   - Duraciones alineadas con la configuración real de Directus; no asumir sus valores por defecto.
   - Sin tokens en `localStorage`, props, URLs o parámetros de descarga.
   - No guardar contraseñas ni copiar roles del navegador como autoridad.

3. **Validación**
   - Un único módulo de sesión (DAL) lee cookies por solicitud y construye `createPrivateDirectus(accessToken)`; sin singleton autenticado ni token público.
   - Cada consulta privada usa las credenciales de esa solicitud; **nunca el token público compartido** ni las queries con `use cache` del sitio.
   - **Re-verificar identidad dentro de cada Server Action**, no solo en layout o página: una action es alcanzable por POST directo y la verificación de página no la cubre ([Data Security](https://nextjs.org/docs/app/guides/data-security)).
   - La existencia de una cookie, o decodificar un JWT sin validación, no basta.
   - El acceso a una orden se resuelve mediante una lectura autorizada de esa orden.
   - Con Cache Components activos (`cacheComponents: true` en `next.config.ts`), ninguna función con `cookies()` entra en `use cache`; la UI autenticada streamea detrás de `<Suspense>` y nunca hace `await` de la sesión en el top-level del layout.

4. **Expiración y refresh**
   - Refresh no se ejecuta durante el render de un Server Component ni escribe cookies desde ese render.
   - No usar temporizadores automáticos del SDK como gestor de sesiones del servidor: `autoRefresh: false` en el cliente privado.
   - **Refresh siempre con `{ mode: "json", refresh_token }` explícito**: el SDK v24 usa `mode: "cookie"` por defecto incluso en `refresh()`/`logout()` y esa llamada falla con json (`@directus/sdk/dist/rest/commands/auth/refresh.js`).
   - Refresh **single-flight por proceso**: una sola solicitud en vuelo comparte la respuesta entre llamadas concurrentes del mismo proceso; la carrera entre pestañas/réplicas es distinta y se prueba aparte (Directus ofrece `SESSION_REFRESH_GRACE_PERIOD`, default 10s, no verificado en el despliegue).
   - Access token vencido: renovar una vez con single-flight y cookies rotadas emitidas en la misma respuesta del Server Action; si la renovación falla, cerrar sesión y pedir login, sin bucle.
   - Refresh o sesión inválidos o vencidos: eliminar las cookies propias, cerrar localmente y pedir login.
   - Error transitorio de red: mostrar indisponibilidad, sin afirmar que las credenciales son incorrectas ni iniciar un bucle de renovación.

5. **Logout**
   - POST protegido.
   - Invalidar el refresh token en Directus y borrar las cookies locales.
   - Limpiar estado privado del navegador.
   - Si Directus no responde, cerrar localmente pero no informar que la revocación remota fue confirmada.

Los comandos necesarios existen en el SDK instalado: `node_modules/@directus/sdk/dist/rest/commands/auth/{login,refresh,logout}.d.ts`.

**Advertencia:** en modo JSON, invalidar el refresh token no demuestra revocación inmediata de todos los access tokens ya emitidos. Su vigencia residual debe considerarse en la política de sesión; verificar también la semántica real de logout en `session`.

### 3.3 Simultaneidad y aislamiento

No proponer un `Map` global como solución de renovación: no coordina réplicas y podría mezclar sesiones si se indexa incorrectamente.

Para el MVP:

- Las lecturas paralelas no renuevan cada una por su cuenta.
- Un flujo explícito concentra el refresh con **single-flight por proceso** (una promesa compartida entre llamadas concurrentes); sigue sin coordinar pestañas o réplicas y tampoco basta un `Map` global: no coordina réplicas y podría mezclar sesiones si se indexa incorrectamente.
- Nunca hay un token de empleado almacenado en un singleton mutable.
- Hay que probar múltiples pestañas, respuestas fuera de orden y logout durante refresh.

Directus documenta `SESSION_REFRESH_GRACE_PERIOD` (default 10 s, según security-limits) para tolerar carreras de renovación server-side. **No se comprobó la versión del servidor, su TTL efectivo ni su comportamiento real:** el despliegue podría tener otro valor u otro modo de invalidación (issue #24310/#20572 documentan refresh de un solo uso que falla bajo carreras). La documentación no basta para garantizar todos los casos de varias pestañas y réplicas.

La aceptación debe demostrar que la rotación no deja cookies obsoletas ni restaura una sesión cerrada, incluso con `Set-Cookie` fuera de orden y varias instancias. Si falla, no aprobar renovación transparente: cerrar localmente, pedir nuevo login y registrar explícitamente esa limitación del MVP. Invalidar un refresh token no demuestra revocación inmediata de access tokens ya emitidos.

Fuente: [Security & Limits](https://directus.com/docs/configuration/security-limits).

### 3.4 Autorización y roles

**Directus debe seguir siendo la autoridad sobre filas y campos.** Next.js no debe reemplazar sus permisos con filtros del menú.

Controles separados:

- **Página:** sesión válida y criterio de ingreso al área.
- **Listado:** consulta con token individual; paginación y filtros validados.
- **Detalle:** nueva lectura autorizada por ID.
- **PDF:** nueva autorización y lectura; no confiar en datos enviados desde el cliente o en haber abierto antes el detalle.

Para roles y políticas:

- Inventariar primero los existentes, incluyendo políticas asignadas directamente al usuario y heredadas.
- No inventar nombres de roles ni conceder lectura global de `order`.
- Autorizar solo los campos y relaciones necesarios.
- Revisar también permisos de archivos, firmas y colecciones relacionadas.
- No conceder administración ni Data Studio por necesitar este frontend: **“App Access” de Directus se refiere a Studio**, no a esta área Next.js.
- Recordar que las políticas son aditivas: una política amplia puede anular en la práctica la intención de otra restrictiva.
- Probar permisos sobre las uniones `order_scales`, `scales_files` y futuras líneas: permitir crear una unión sin validar ambos extremos puede asociar una orden a datos ajenos aunque el menú y la lectura estén restringidos. Revisar campos de escritura y efectos de mutaciones relacionales anidadas.
- Para perfil, limitar `directus_users` a la persona actual y a nombre, apellido y título; nunca habilitar edición de `role`, `policies` u otros usuarios. Para firmas, verificar acceso privado a `directus_files` y que carpetas públicas no las hagan accesibles sin sesión. Auditar la accountability efectiva de cada Flow, especialmente si ejecuta bajo una cuenta de servicio; exigir que no eleve los permisos de pago/movimiento declarados.

[Guía de seguridad de Directus](https://directus.com/docs/guides/security/best-practices): advierte expresamente sobre escalada en uniones, acceso a archivos y Flows con privilegios elevados. Es evidencia de un riesgo, no un informe de la configuración real.

Fuente: [Control de acceso de Directus](https://directus.com/docs/guides/auth/access-control).

`scales.client → clients` nullable aún se necesita para filtrar/validar básculas; `inventory.price` existe (decimal(10,2), nullable, default `NULL`). `order.status` ya existe (`draft`, `paid`, `cancelled`, default `draft`, NOT NULL); las transiciones están decididas en §3.9, incluida `cancelled → paid` directa. El usuario informó que entonces no había órdenes, pero no se consultaron registros. La colección de líneas y vínculo de movimientos a orden siguen sin crearse. No añadir campos, relaciones ni Flows ni alterar datos sin autorización expresa.

### 3.5 Caché, CSRF y secretos

- Mantener Cache Components habilitado.
- Leer cookies y parámetros dinámicos dentro de componentes bajo `Suspense`, no en el shell raíz.
- No usar `"use cache"` compartido para identidad, órdenes, relaciones privadas o PDF.
- No introducir tokens como argumentos o tags de funciones cacheadas.
- Usar `cache: "no-store"` en las solicitudes privadas y respuestas de descarga no almacenables.
- No incorporar caché privada del navegador como optimización inicial: la guía actual de Next.js 16 permite `use cache: private` para identidad, pero guarda resultados en el navegador y exige evaluar explícitamente revocación, cambio de usuario y navegación atrás antes de usarla. No confundir «privada» con «siempre reautorizada».
- Invalidar estado privado al cerrar sesión o cambiar de usuario; el `QueryProvider` actual mantiene caché en el navegador (`providers/QueryProvider.tsx:6-15`).
- Login, refresh y logout son operaciones POST mediante las Server Actions separadas de auth; usar Next `cookies()` en el contexto permitido para gestionar las cookies. Validar sesión, CSRF/origen cuando corresponda y autorización en cada operación. Las Server Actions incorporan comparación `Origin`/`Host`, pero siguen necesitando autenticación y autorización.
- Validar destinos de retorno para evitar redirecciones abiertas.
- Limitar intentos de login y generación costosa reutilizando los mecanismos instalados, sin usar esos mecanismos como sustituto de permisos.
- Mantener cuerpos de autenticación, cookies y errores SDK completos fuera de los registros. El documento de errores/logger citado antes no existe en este árbol: especificar redacción y clasificación al implementar cada operación; no bloquear la seguridad en un enlace inexistente.

El proxy actual excluye `/api` y determinadas solicitudes de prefetch (`proxy.ts:68-82`). **No puede ser el único control de autorización.**

Guías instaladas contrastadas:

- `node_modules/next/dist/docs/01-app/02-guides/authentication.md:1131-1181,1356-1374`.
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md:40-69,295-314`.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md:6-7,67-91`.

Enlaces oficiales:

- [Autenticación en Next.js](https://nextjs.org/docs/app/guides/authentication).
- [Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies).
- [Seguridad de datos](https://nextjs.org/docs/app/guides/data-security).

### 3.6 Área privada, dashboard y sidebar

Rutas propuestas, renombradas por el usuario de `/metrologia/*` a la raíz (2026-11-11):

- `/login`
- `/dashboard` (entrada al área: dashboard, no redirección directa a la tabla)
- `/dashboard/ordenes` y `/dashboard/ordenes/[id]`
- `/dashboard/movimientos` y pantallas de catálogo según §3.8

No se propone una ruta API por colección ni una ruta PDF dedicada. Separar login del layout protegido para evitar ciclos de redirección. La entrada privada es un dashboard con navegación a la izquierda y contenido ocupando el resto. La configuración se abre como diálogo desde el menú del usuario (sin ruta propia; `/dashboard/configuracion` se eliminó en Batch 2). El área privada admite tema claro/oscuro vía `next-themes`; el sitio público permanece oscuro forzado conforme a `DESIGN.md`, reutilizando `components/ui/sidebar.tsx`; las capturas externas son referencias de agrupación/ubicación, no especificación literal de colores ni contenido.

**Bloques previstos, aún no instalados:** `components.json` registra `@efferd` con una URL antigua sin estilo (`https://efferd.com/r/{name}.json`). En esta reevaluación esa URL devolvió **«Style Missing»**, y la [URL pública con estilo `aria-nova` para `settings-1`](https://efferd.com/r/aria-nova/settings-1.json) **sí devolvió el manifiesto y código** sin credenciales; el HTTP 401 pertenece a una consulta previa y no describe el estado actual. La [galería indicada por el usuario](https://efferd.com/blocks/settings#settings-1) muestra el bloque como referencia. Su manifiesto contiene perfil editable, avatar, email, notificaciones y contenido de ejemplo ajeno: aprovechar composición solamente, sin instalar automáticamente campos o acciones no solicitadas. `dashboard-3` sigue siendo de soporte al cliente (CSAT, conversaciones, tickets) y [su manifiesto con estilo](https://efferd.com/r/aria-nova/dashboard-3.json) incluye `chart`, `table`, `@efferd/indicator` y `@efferd/app-shell-3`. **Resolución en Batch 2: no se instalaron bloques Efferd**; el shell y la configuración se construyeron con componentes locales y la URL del registro quedó sin corregir (no se usa). Si más adelante se quisiera un bloque, corregir la plantilla a `https://efferd.com/r/{style}/{name}.json`, revisar licencia, dependencias y compatibilidad con `components/ui` y no sobrescribir componentes locales. No copiar contenido ficticio. [Configuración actual de Efferd](https://efferd.com/docs/quick-setup).

**i18n del área privada:** el proyecto usa `next-intl`, locale `es`, archivos `i18n/messages/es/<namespace>.json` con su clave raíz y ensamblaje únicamente en `i18n/request.ts`. **Batch 1 ya creó** `i18n/messages/es/auth.json` (namespace `auth`) y lo registró en `i18n/request.ts`: copy real de acceso de empleados (sin registro público ni enlaces falsos), claves de estado de sesión y las claves de error del contrato (`invalidCredentials`, `mfaRequired`, `mfaInvalid`, `noRole`, etc.). **Batch 2 ya creó** `i18n/messages/es/dashboard.json` (namespace `dashboard`: navegación, configuración, perfil, foto y estados) y `i18n/messages/es/app.json` (namespace `app`: skip link y toggle del sidebar — desvío menor documentado: el plan preveía `privateApp` y se usó `app`), ambos registrados en `i18n/request.ts`. Regla vigente: las Server Actions devuelven **claves**, y la traducción ocurre solo en el cliente con `useTranslations`; reutilizar `directusErrors` para errores comunes, sin duplicarlos. Cuando lleguen listados y operaciones, crear `i18n/messages/es/metrology.json` (namespace `metrology`, grupos por órdenes, inventario, movimientos y catálogos) **solo para mensajes efectivamente usados**, con confirmaciones, denegaciones y estados de integridad donde correspondan. Reutilizar los catálogos existentes `search`, `share` y `directusErrors` en vez de crear traducciones duplicadas. Agregar cada catálogo al ensamblaje de `i18n/request.ts` al usarlo; componentes cliente usan `useTranslations`, contextos de servidor `getTranslations`. Mantener queries sin `next-intl`: el repositorio resuelve mensajes y los pasa a la consulta cuando corresponda. No añadir un segundo sistema de i18n ni valores privados a JSON de traducciones.

**Órdenes**

- **Pestañas y orden:** `Todas` (predeterminada), `Borradores`, `Pagadas` y `Canceladas`; ordenar cada pestaña por `order.date_created DESC`.
- **Filas:** folio, fecha de creación, cliente, básculas, técnico, estado y enlace al detalle. Cuando aplique, mostrar «Requiere corrección» por referencia rota o discrepancia de stock atribuido; es un indicador, no un cuarto estado.
- **Acciones:** sin tarjetas métricas, precios en la lista ni acciones rápidas de pagar/cancelar/reabrir. Las acciones están en el detalle; pagar/cancelar requiere confirmación de efectos esperados sobre stock y revalidación en backend.

**Vistas, URL y búsqueda**

- Ofrecer vistas tabla y lista en escritorio y móvil. Sin parámetro de vista, usar tabla en escritorio y lista en móvil. Mantener búsqueda, filtros, pestaña, página y vista exclusivamente en URL mediante nuqs; no duplicar preferencias en `localStorage`.
- La propuesta existente de basar la tabla en `@tanstack/react-table` se mantiene como opción de implementación, sujeta a justificar una necesidad concreta; no es dependencia directa y no se agregará automáticamente para una tabla básica. Antes de incorporarla, comprobar si basta la tabla React Aria de `components/ui/table.tsx`; adaptar cualquier uso a componentes locales y a la guía oficial Data Table/shadcn. La lista usa `components/ui/item.tsx`.
- En móvil, el scroll horizontal de la tabla queda dentro de su panel, no en toda la página. Ambas vistas tienen paginación Anterior/Siguiente y búsqueda compartida por folio o nombre de cliente (nunca RFC), sobre el conjunto autorizado completo y antes de paginar.
- Combinar filtros de pestaña/estado y fechas. «Requiere corrección» filtra solo referencias confirmadas faltantes o discrepancias de movimientos atribuidos. «No se pudo verificar» es un indicador separado por permiso insuficiente, no corrupción ni parte del filtro. No aprobar PDF/transiciones ni revelar detalles no autorizados cuando la integridad sea desconocida.
- Cada cambio de filtro reinicia la página a 1. Cambiar pestaña conserva búsqueda y fechas y reinicia la página a 1. Interpretar `order.date_created` por día calendario `America/Mexico_City`, independientemente de la zona del dispositivo.
- El filtro de fecha tiene modos mutuamente excluyentes: **Período** aplica el primer día seleccionado de inmediato y, al elegir el segundo, incluye todo el rango; **Días específicos** filtra solo los días discretos seleccionados.
- `components/shared/forms/DateRangePicker.tsx` y su test son avance enfocado aún no integrado; se pospusieron typecheck/pre-deploy por fallos/cambios ajenos y la ruta de órdenes todavía no existe. Fuse filtra solo los elementos recibidos y el DataTable de cliente no resuelve páginas remotas; falta diseñar/probar búsqueda en todo el conjunto autorizado y su paginación. No afirmar que ya está resuelto.

**Sidebar y módulos**

- Grupos filtrados por permisos efectivos: **Operación** (Órdenes, Movimientos) y **Catálogos** (Clientes, Básculas, Inventario, Marcas, Modelos, Proveedores).
- En todos los listados privados, reflejar en URL mediante nuqs los filtros, búsqueda, pestaña de estado (cuando aplique), página y vista; cada cambio de filtro lleva a página 1.
- Búsqueda/filtros por módulo:
  - Clientes: nombre y paginación; nunca RFC.
  - Órdenes: folio o nombre de cliente; nunca RFC.
  - Movimientos: estado, origen (orden/independiente), artículo, rango de fechas y búsqueda.
  - Inventario: tipo, disponibilidad (con/sin existencia) y búsqueda.
  - Básculas: `serial_number`/`identification`, cliente y estado; el filtro de cliente depende de `scales.client`, relación propuesta y aún no creada.
  - Marcas, Modelos y Proveedores: nombre y paginación.
- La búsqueda abarca el conjunto autorizado completo, no solo la página visible; la indexación remota con Fuse no está demostrada. Los nombres pueden quedar en historial del navegador, logs o enlaces compartidos; evitar RFC reduce, pero no elimina, esa exposición.

**Cuenta, configuración y accesibilidad**

- El menú de usuario vive en el pie del sidebar (implementado en Batch 2): avatar con fallback de iniciales, nombre/email y únicamente Configuración y Cerrar sesión. El avatar se sirve como asset público por UUID vía `DirectusImage` (decisión del usuario; sin token en el DOM ni token público en el cliente). No incluir Upgrade, Billing, Notifications ni un enlace Config separado.
- Configuración (implementada) usa tabs verticales a la izquierda y contenido a la derecha, con Apariencia y Perfil. Apariencia ofrece únicamente tamaño de fuente Pequeño/Predeterminado/Grande (control segmentado con `components/ui/tabs.tsx` — el plan preveía `radio-group.tsx` y se usó el control segmentado ya existente) y movimiento reducido on/off con `components/ui/switch.tsx`; sin selector de tema. Antes de una elección local, respetar `prefers-reduced-motion`; la elección local la sobreescribe. Ambas preferencias se guardan solo en el dispositivo (`localStorage`), no en Directus.
- Perfil (implementado) muestra nombre, apellido, email, título y foto. Son editables nombre, apellido, título, ubicación, descripción y etiquetas (6 campos, acción `updateProfile`); email es de solo lectura y el avatar se sube con recorte circular por el propio empleado (`uploadAvatar` → `directus_files`, ≤2 MB, solo imágenes). No mostrar ni editar contraseña, rol u otros datos sensibles.
- Las capturas externas pueden faltar en otro equipo y solo muestran composición/colocación, no características de producto. Ocultar enlaces no sustituye autorización en servidor. Mantener tema oscuro y estado activo neutral; drawer accesible con título, foco inicial/de retorno, Escape y teclado, `aria-current` y enlace para saltar al contenido.

### 3.7 PDF actual, descargable y no persistido

**Propuesta preferida, probada solo como prototipo:** usar pdfcn/Forme en el navegador para previsualizar y generar la descarga, sin un Route Handler específico de la aplicación. El renderizado browser funcionó en Storybook con datos sintéticos; no se probó su integración con Next.js, la lectura/autorización de órdenes reales ni su descarga privada. La referencia pública de [pdfcn](https://www.pdfcn.dev/llms.txt) muestra un control de descarga, pero no demuestra seguridad para documentos privados. `@formepdf/core` v0.25.0 expone `renderDocument(element): Promise<Uint8Array>` en `dist/browser.d.ts`.

En cada acción **Descargar**:

1. Una operación de servidor valida sesión, ID y permisos efectivos, y vuelve a leer la orden **guardada** con sus campos, relaciones y archivos necesarios, usando la identidad del empleado.
2. Si la orden o cualquier dato requerido no está disponible o autorizado, rechazar la descarga completa; nunca producir un PDF parcial ni tratar una denegación como un campo oculto.
3. Enviar al navegador solo los datos y bytes de archivos autorizados y necesarios para ese documento; no enviar URLs públicas de firmas ni URLs arbitrarias.
4. Generar el PDF en memoria en el navegador y descargarlo. No crear registros, subir archivos ni persistir el PDF en Directus.

El preview puede reflejar ediciones locales aún no guardadas, con aviso prominente, pero **nunca será la fuente de una descarga**. Al detectar revocación o bloqueo, invalidar el preview en la UI y rechazar nuevas lecturas; volver a autorizar antes de cada descarga. Esto no puede borrar datos que el navegador ya recibió. No usar URL pública de firma ni token público para resolver assets. Validar autorización por cada archivo, tipo/tamaño y transferencia mínima necesaria.

La alternativa de Route Handler solo se reconsidera si pruebas medidas de WASM, bundle, memoria, rendimiento, transferencia de assets o seguridad muestran una limitación concreta del navegador. No se fija endpoint ni se presuponen headers de respuesta para esa alternativa.

**Firmas:** usar `signatureToPng()`/`signatureToSvg()` de `components/shared/forms/SignaturePad.tsx` para exportar solo trazos con fondo transparente, sin rasterizar el fondo del pad; `onChange` entrega los trazos. La acción incorporada de guardar solo descarga localmente y **no** carga a `directus_files`: integrar la carga de firmas actuales con identidad y permisos individuales y comprobar la transparencia del archivo y del PDF. `PdfSignatureBlock` es un bloque visual, no una prueba de aprobación. El motor instalado sí expone `certifyPdf()` (`node_modules/@formepdf/core/dist/index.d.ts:279`), pero no hay evidencia de certificados o un proceso autorizado. No incorporarlo al MVP sin un requisito explícito. Mostrar la firma actual y solo el nombre de la persona firmante inmediatamente anterior; nunca mostrar la imagen de su firma anterior. Un cambio real de firmante exige capturar una firma nueva antes de guardar o descargar. Persistir nombres previos por firmante es una propuesta mínima pendiente de verificar contra metadatos/campos disponibles; no asumir campos existentes ni revisiones de Directus.

**Imágenes privadas:** no usar directamente las URL públicas de `getAssetUrl()` para firmas ni confiar en que el renderer autentique `fetch` por sí mismo. El servidor debe leer cada archivo necesario con la identidad del empleado, aplicar permisos y límites de tipo/tamaño y transferir solo sus bytes autorizados al navegador como datos en memoria. No aceptar URLs arbitrarias ni exponer URLs firmadas/públicas. En Batch 9 elegir y probar un transporte acotado para esos bytes (tamaño máximo, tipo MIME, fallos, `no-store` y limpieza de objetos temporales); el contrato actual `signatureUrls` de la plantilla acepta URLs suministradas y **no** demuestra cómo pasarle bytes privados. Abrir en pestaña nueva debe conservar la activación del gesto del usuario sin abrir una URL pública ni conservar una pestaña con contenido privado al fallar la reautorización.

**Varias básculas:** el esquema **sí confirma** `order.scales` M2M a través de `order_scales.sort`. Renderizar todas las autorizadas en orden estable, sin truncarlas silenciosamente por límites de consulta; verificar los permisos tanto en la unión como en `scales` y sus relaciones/archivos.

**Paginación:** en el prototipo se observaron 1–5 básculas sin pérdida de equipos, cuatro filas de refacciones en la primera página y la quinta en la segunda. Esta última modificación aún carece de verificación independiente. Queda probar contenido largo, encabezados, pies, filas grandes y bloques de firma fuera de esas muestras. No aplicar `noWrap` a toda la tabla. En el detalle de órdenes `paid`/`cancelled`, preview/PDF son de solo lectura si los datos y permisos están íntegros; si la orden queda bloqueada, no mostrar preview obsoleto.

**Integridad y presentación del PDF:** todos los campos requeridos, incluidas ambas firmas, y al menos una báscula se exigen en cada guardado, cualquiera que sea el estado; no se persiste un estado intermedio inválido. `order.date_created` es la fecha impresa; `description` es el texto general de servicio para todas las básculas; receptor y departamento son captura manual. La visibilidad de PDF no altera datos ni permisos: valores no monetarios disponibles se muestran por defecto y todos los valores monetarios se ocultan por defecto. Cada valor dinámico puede mostrarse u ocultarse individualmente, incluso si es obligatorio en la orden guardada; solo la indicación de estado permanece siempre visible. Los controles grupales para mostrar u ocultar todos los importes cubren precios unitarios, importes de filas, cuatro cargos, subtotal, IVA y total; el valor oculto deja su casilla vacía sin sustituirlo ni cambiar la estructura de la plantilla. Nada de esto se persiste. `inventory.price = NULL` no es cero: fila sin precio, importe y todos los totales derivados se imprimen en blanco, sin sumas parciales engañosas; una captura explícita de cargo `0.00` se imprime `$0.00` cuando está visible. Ningún fallo o denegación se representa como ocultamiento. Errores y mensajes se planifican aparte en `docs/plans/directus-errors-logger.md` (antecedente ausente en este árbol).

Referencias:

- [Índice pdfcn](https://www.pdfcn.dev/llms.txt).
- [Instalación y distinción Forme/Takumi](https://www.pdfcn.dev/docs/installation.md).

### 3.8 CRUD privado escalable sin CRUD genérico

Mantener **separados** el cliente público `staticToken()`/`"use cache"` y los consumidores privados por solicitud. `getClientsQuery()` hoy convierte errores en `[]` y el count en `0`; un recurso privado no puede reutilizar ese resultado como si la consulta hubiera tenido éxito. El registro de `/debug` es para lectores del inspector público, no para autorizar ni despachar mutaciones privadas. Las excepciones a `.agents/rules/directus-sdk-client.md` y `.agents/rules/directus-omit-sensitive-fields.md` deben ser **acotadas al módulo privado**, no exponer PII, stock o precios en el Schema/inspector públicos.

- Base compartida mínima: sesión individual, cliente SDK por solicitud, paginación/entrada validada y contrato de fallos seguros. Nunca confiar en el menú para autorizar.
- Para `order`, agregar esquema tipado en `types/schema.ts`, listas de campos explícitas (`*.fields.ts`), consultas y un repositorio privado siguiendo los patrones de `services/domain/db/queries/collections` y `services/domain/db/repositories/collections`. Separar proyecciones mínimas para listado, detalle, edición y PDF, incluidas `order_scales`, cliente, técnico, firmas y relaciones autorizadas; no pedir datos que la pantalla no necesita. Líneas, cargos/IVA persistidos y vínculo de movimientos siguen siendo propuestas de esquema, no campos existentes confirmados. Transformar y validar la lectura autorizada hacia el `ServiceOrderData` existente de `components/pdf/templates/service-order.tsx` en vez de duplicar su contrato; fallar cerrado ante campos requeridos ausentes o denegados. Un ID de firma no equivale a bytes autorizados para el PDF.
- Para las demás tareas, definir los campos/relaciones y consultas explícitas que realmente necesitan, reutilizando los patrones existentes. Crear operaciones/repositorios cuando aporten una necesidad concreta, sin añadir por defecto una capa por colección. Cada mutación valida en servidor permisos, límites de campos y estado. `order` conserva su lógica propia; **no** crear un formulario universal a partir del esquema.
- Clientes, Básculas, Inventario, Movimientos, Marcas, Modelos y Proveedores tienen cada uno una pantalla de tabla/listado, sin conmutador tabla/lista. Clientes, Básculas e Inventario se crean/editan en páginas completas de detalle; Marcas, Modelos y Proveedores usan diálogos breves; Movimientos usa una página completa propia y muestra artículo, cantidad, tipo, stock anterior/posterior previsto y efecto en stock. Crear una retirada requiere confirmación; crear una entrada solo preview y Guardar; editar cualquier movimiento existente requiere confirmación. El servidor vuelve a validar al guardar. La clasificación (entrada/retirada) se elige explícitamente y no se infiere del estado; notas son siempre opcionales. La pantalla general muestra todos los movimientos autorizados y el origen/enlace de orden; los vinculados son de solo lectura allí. Su edición/corrección solo se inicia desde detalle de orden con permisos efectivos y vínculo fijo/solo lectura, validado también en servidor. La creación desde listado general siempre queda independiente/sin orden; el empleado de almacén con permiso efectivo puede crear movimientos independientes sin orden. El vínculo de un movimiento independiente queda sin asignar. No exigir permiso de pago para estas creaciones independientes. Flows pueden crear movimientos vinculados. `inventory_movements.notes` son notas del movimiento, distintas de `inventory.notes` (notas del artículo).
- Reutilizar `components/ui/{table,item,sidebar,tabs,pagination,drawer}.tsx` y `components/shared/forms/{DateRangePicker,SignaturePad}.tsx` allí donde las pantallas realmente los consuman. Extraer primitivas de presentación compartidas después de observar usos repetidos; no crear por defecto formularios genéricos CRUD/schema-driven ni capas de repositorio por colección. Mantener separadas las reglas de autorización, stock, órdenes y PDF. Una colección nueva se agrega cuando haya una tarea real, con pruebas de acceso de dos usuarios; uniones (`order_scales`, `scales_files`) no requieren pantalla por sí mismas.
- `clients` incluye RFC/contacto: aislar sus consultas privadas de las públicas. `scales` permite gestionar básculas del cliente; `inventory` y `inventory_movements` atienden existencias y cambios. Perfil propio no implica administrar usuarios ajenos.
- **Movimientos de préstamo:** `inventory_movements.status` incluye `sold`, `reserved`, `on_hold`, `defective`, `damaged`, `returned`, `decommissioned` y `loan` (loan añadido y verificado). `returned` significa devolución defectuosa al proveedor, no devolución de préstamo. Entrega = nuevo `withdrawal` con status `loan`; devolución = nuevo `entry` con status `loan`, preservando el original. Tipo explícito, no inferido del status ni emparejado automáticamente con el movimiento original. El flujo observado suma en entry y resta en withdrawal; status/notas no cambian el efecto. Notas siempre opcionales. No prometer relación formal préstamo/devolución, saldo pendiente ni guardia contra devolución excesiva. `inventory_movements.notes` es distinto de `inventory.notes`.
- **Regla de cliente/proveedor confirmada:** todo `type = entry` requiere un proveedor real (`supplier`) y todo `type = withdrawal` requiere un cliente real (`client`), cualquiera que sea `status`; no inventar identidades ni crear excepciones basadas en status. En una compensación de orden que devuelve partes al stock (`entry`), el usuario decidió **elegir proveedor real al confirmar esa transición**, no guardarlo por línea: si falta proveedor o permiso efectivo, se rechaza toda la operación. Por tanto, la devolución de préstamo (`entry`, `status = loan`) requiere proveedor; la devolución defectuosa al proveedor (`withdrawal`, `status = returned`) requiere cliente y no proveedor. Un movimiento independiente `withdrawal` por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real se rechaza: no se inventa cliente ni se omite el requisito. No asumir que una devolución de préstamo se vincula al movimiento de entrega original.
- Metadatos leídos de `inventory_movements.supplier` y `.client`: ambos son relaciones UUID M2O, respectivamente a `suppliers` y `clients`. Ambos tienen `meta.required = true` en configuración base; la condición `type != entry` para supplier y `type != withdrawal` para client los vuelve `readonly=true`, `required=false`, `hidden=true` y `clear_hidden_value_on_save=true`. Ambas columnas son nullable y tienen `meta.validation = null`. `type` ofrece las opciones `entry` y `withdrawal` y la columna también es nullable. Estas condiciones describen configuración de Studio y no prueban enforcement API. En la futura UI/validación, exigir la relación que corresponde al tipo, sin variar la regla por `status`; validar también en servidor. Las pruebas aisladas de escritura API se difieren expresamente para más adelante y no están realizadas; cuando se autoricen, incluir cambio de tipo en update, limpieza de relación opuesta, relación ausente/null, tipo inválido y, donde aplique, cliente derivado de una orden vinculada. No inventar reglas adicionales para el cliente derivado de orden. No modificar backend ni tratar metadata Studio como requisito de base/API.

### 3.9 Orden, editor y preview

- `scales.client` nullable es relación propuesta, aún no creada; no inferir dueños previos. Elegir cliente filtra nuevas selecciones; mantener selecciones existentes y señalarlas incompatibles si se cambia cliente. No borrarlas silenciosamente; bloquear guardado/PDF hasta resolver y validar pertenencia en servidor. Una báscula inactiva existente y del mismo cliente sigue visible y puede pagarse en borrador, pero no se ofrece para nuevas selecciones. Si se reasigna a otro cliente tras pago, bloquear PDF hasta reparar.
- Si se borró excepcionalmente un cliente, báscula o parte referenciada, bloquear edición y PDF hasta restaurar o sustituir por registro válido; no soltar líneas ni asumir cascada. El personal no puede borrar físicamente registros privados, incluidos movimientos; solo admin con permisos efectivos puede hacerlo excepcionalmente. Personal con permiso efectivo de edición sí puede editar movimientos. Flujo de reparación de relaciones/datos faltantes es estrecho y disponible a personal autorizado aun fuera de draft, no habilita edición general de contenido no-draft. Mantener cliente↔báscula.
- Parte archivada ya vinculada sigue visible en orden/PDF, tanto si se archivó antes como después del pago; su cantidad puede cambiarse en draft y al pagar descuenta stock real tras validación. No permitir nueva selección mientras archivada. No confundir archivada con inexistente.
- Al abrir el detalle de una orden, el PDF/preview ocupa el lado izquierdo del área de contenido (a la derecha de la navegación general). «Editar» abajo a la derecha abre el formulario en un panel desde la derecha; en móvil, usar un drawer accesible sin tapar permanentemente el preview. En estados no editables, no ofrecer edición normal. Barra superior con solo Descargar PDF, Compartir y Abrir PDF en nueva pestaña: para abrir/descargar se reautoriza la versión guardada, sin enlaces públicos ni tokens en URL. «Compartir» copia el enlace privado al detalle; abrirlo exige sesión y permisos propios y no crea una excepción de acceso. Preview local refleja cambios sin guardar y advierte prominentemente; descarga de draft usa versión guardada y reautoriza. Paid y cancelled también descargables. Descargar en memoria, nunca persistir. Watermark CANCELADA opcional mediante `components/pdf/watermark.tsx`; etiqueta discreta de estado siempre visible en cualquier PDF (Borrador/Pagada/Cancelada, copia propuesta). Imprimir UUID completo `order.folio`, no consecutivo. Relaciones rotas o discrepancia de movimientos bloquean PDF. Renderizado en navegador es la propuesta preferida, aún pendiente de prueba; Route Handler solo se evalúa si mediciones muestran una limitación concreta.
- Sin descuentos. IVA opcional 16% se decide y guarda por orden (su persistencia aún debe modelarse), distinto de visibilidad de cada descarga. Cuatro cargos manuales opcionales: mano de obra, horas extra, viáticos y otros. Subtotal = precios actuales × cantidades más cargos; IVA sobre subtotal; total calculado en MXN con dos decimales y base íntegra. Una orden puede pagarse sin refacciones, cargos ni precios; no bloquear por `inventory.price` `NULL` ni cero. Sin partes y sin cargos, subtotal y total quedan en blanco incluso al mostrar todo. Precio actual vivo, sin snapshot histórico. Si fila tiene precio `NULL`, importe y subtotal/IVA/total derivados quedan en blanco, nunca suma parcial; stock de las partes incluidas sí se descuenta. Cargo explícito `0.00` se imprime `$0.00` cuando visible. El usuario aprobó el cálculo existente de `ServiceOrderAmounts`: IVA = 16% del subtotal completo en centavos, redondeado **una vez** al centavo con `Math.round(subtotal * 0.16)` (`components/pdf/templates/service-order.tsx`); fijar ejemplos de fracciones de centavo en Batch 0. Es un importe de orden/PDF, no una especificación de factura fiscal. Ningún valor monetario aparece por defecto: ocultar unitarios, importes de fila, cuatro cargos, subtotal, IVA y total; mostrar individualmente por descarga y controles grupales «mostrar todos»/«ocultar todos los precios». No persistir visibilidad. Probar el redondeo monetario aprobado.
- La descarga refleja datos guardados y autorizados actuales de Directus, también para órdenes `paid`; no es una copia histórica. En cada descarga, volver a autorizar y consultar en servidor con la identidad del empleado; un borrador del navegador no es autoridad. El preview, en cambio, puede reflejar ediciones locales sin guardar con aviso prominente. Si falta un dato/relación requerido o hay denegación, no emitir PDF incompleto; al detectar revocación/bloqueo, invalidar el preview visible y rechazar nuevas entregas, sin prometer borrar bytes ya obtenidos. El historial actual del backend no implica una UI paralela ni un snapshot del PDF.
- La regla de **solo editar en `draft`** aplica a cualquier documento, no a clientes, inventario o movimientos por ser colecciones de apoyo. Cualquier documento puede volver a `draft` desde otro estado con una transición explícita y permiso, pero cambiar el estado no autoriza editar contenido en la misma operación mientras aún no se haya validado el cambio. En Next.js se comprueba el estado al mostrar el editor y en cada mutación; la interfaz no sustituye la validación de estado y permisos en el servidor. El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js, y que cambios de contenido no-draft en `order_scales` y futuras líneas deben bloquearse por Studio/API salvo reparación autorizada y acotada. Esto requiere enforcement backend efectivo, aún no diseñado ni probado.
- `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). Se permiten `draft → cancelled`, `cancelled → draft`, `paid → draft`, `paid → cancelled` y directamente `cancelled → paid`. `draft → paid` confirma pago. Contenido normal solo editable en draft. `paid → draft` conserva movimientos del último pago confirmado; repagar concilia delta. Cancelar paid compensa neto; cancelled→paid directo concilia desde neto atribuido real. No se requieren fecha/monto/método de pago. Historial de cancelaciones ya existe según usuario; no duplicar. Flow actual «Movimientos Inventario» solo atiende CRUD de `inventory_movements`, no cambios de orden; Flow dedicado es recomendación, no decisión. Línea por artículo, cantidad entera positiva, cero líneas permitido; draft no reserva ni descuenta stock.
- Personal no puede borrar físicamente nada en el área; borrado excepcional solo por admin con permisos efectivos. Personal con permiso efectivo puede editar movimientos manualmente; normalmente corregir con movimiento compensatorio. La lista general muestra todos los movimientos autorizados con origen/enlace de orden; los vinculados son read-only allí. Edición/corrección solo desde detalle de orden con permisos efectivos, vínculo fijo y validación server-side. Crear desde la lista general siempre es independiente/sin orden. Si movimiento atribuido a orden se edita o se borra excepcionalmente, bloquear siguiente pago/cancelación y PDF hasta registrar compensación y volver a demostrar que los movimientos netos atribuidos coinciden con el último saldo confirmado de la orden (último pago, o cero después de cancelar); desbloqueo automático al reconciliar. Se permite `paid → draft` y editar contenido aunque exista discrepancia; siguen bloqueados PDF, repago o cancelación. Comparar movimientos atribuidos, no stock global; cambios de líneas draft no alteran baseline pagado. Reemplazar parte en paid requiere compensar retiro previo + debitar sustituta, validar stock y solo entonces desbloquear. Si falta permiso de movimientos o stock, queda bloqueado hasta que alguien autorizado complete; nunca saltar políticas.
- El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js; también deben bloquearse por Studio/API ediciones de contenido no-draft de `order_scales` y futuras líneas de orden, salvo reparación autorizada y acotada. Flow actual «Movimientos Inventario» no es order-aware. La documentación oficial de Directus indica que Filter puede pausar y Throw Error/rechazo de condición cancelar una transacción, pero eso no demuestra atomicidad de múltiples escrituras ni seguridad ante concurrencia en esta instancia. Preferencia del usuario: Flows primero; usar extensiones solo si no se puede probar atomicidad, idempotencia y concurrencia con Flows. Esto no autoriza crear un Flow dedicado ahora. **Decisión de permisos para pagar:** para confirmar un pago que necesita crear movimientos de inventario, la persona debe tener ambos permisos efectivos de Directus: pagar/cambiar la orden y crear los movimientos necesarios. Si falta cualquiera, rechazar el pago completo sin efectos parciales sobre stock ni visibilidad/estado de la orden; no conceder implícitamente creación limitada a esa orden ni eludir Directus. La regla ya aplica también a reparaciones/conciliaciones que necesiten crear movimientos. Si no se necesita crear ningún movimiento (por ejemplo, orden sin refacciones), no exigir permiso de creación que no se usa. Las creaciones independientes de la pantalla general requieren permiso efectivo de creación de movimientos, pero no permiso de pago. Cambio de receptor en mismo cliente exige nueva firma cliente antes de guardar/PDF; cambio de técnico, nueva firma técnico; cambio de cliente en paid, ambas firmas nuevas; sustituir báscula bajo mismo cliente no requiere re-firma. `SignaturePad` (`components/shared/forms/SignaturePad.tsx`) es la captura prevista en editor; emite trazos con `onChange` y exporta PNG/SVG de trazos con fondo transparente. Su acción de guardar solo descarga localmente: falta cargar la firma con permisos a `directus_files` y verificar que el PDF no agregue el fondo del pad. Mostrar la imagen de la firma actual y solo el nombre del firmante inmediatamente anterior, con atribución precisa; nunca la imagen de la firma previa. Usar exactamente «Anteriormente se habia firmado por: » en texto pequeño `text-muted-foreground` y su equivalente en PDF. Un cambio real de firmante exige una firma nueva antes de guardar/descargar. Solo se conocen campos actuales de firma; persistir el nombre previo por firmante es una propuesta mínima pendiente de confirmar con metadatos, no un campo existente confirmado ni una suposición de Directus revisions. Enlace orden-movimiento, detección de cambios/borrados, atomicidad, idempotencia, concurrencia y permisos siguen sin prueba. Stock se revalida al pagar; precio nulo/cero no impide pago.

### 3.10 Reevaluación de dependencias y pruebas que no se pueden adelantar

- **Batch 3 lee lo que existe:** listados y detalle de campos actuales; el origen de movimientos, el filtro por dueño de básculas y la proyección _completa_ a `ServiceOrderData` dependen de relaciones/campos todavía inexistentes. Mantener esos controles explícitamente pendientes o sin activar; no fingir valores vacíos, filtrar localmente una sola página ni inferir integridad. La proyección completa se implementa después de Batch 4, junto al editor en Batch 8 y se valida de nuevo para descargar en Batch 9.
- **Batch 4 establece la frontera de esquema y permisos, no demuestra por adelantado el ciclo de pagos del Batch 7:** ampliar de forma compatible (`scales.client` nullable, líneas, cargos, vínculo y nombres previos si se justifican), preservar lectores/escritores existentes y ensayar reversión sin destruir datos. Antes de cerrar Batch 4, probar por API/Studio un bloqueo provisional efectivo de cambios de `order.status` hacia estados con efectos pendientes; ocultar botones en Next.js no basta. Los guards API/Studio para cantidades, relaciones y escrituras de Batch 5–6 se prueban antes de habilitar esas mutaciones; las garantías transaccionales de las transiciones de orden se diseñan y prueban en Batch 7, sin presumir que un Filter Flow las proporciona. Si no se consigue probar en un entorno autorizado, Batch 7 no habilita pago/cancelación ni se cierra.
- **Permisos y prueba representativa no son una opción decorativa:** cambios de perfil (Batch 2), catálogos (5), movimientos (6), órdenes (7–8) y archivos (8–9) necesitan autorización específica para consultar políticas/datos y probar escrituras en entorno aislado. El usuario indicó que **él preparará cuentas y un entorno aislado y ejecutará las pruebas necesarias**; acordar en cada batch casos, precondiciones y evidencia verificable con datos sintéticos/redactados, sin asumir acceso del asistente ni inferir resultado de una intención de prueba. Si falta entorno o evidencia, documentar el bloqueo y no activar esa capacidad; un mock solo prueba código local.
- **Directus Flow no equivale a transacción distribuida:** un Event Hook Filter puede detener su evento; un Action es posterior y no bloquea. Ninguno de esos datos públicos demuestra que todas las escrituras de stock, orden y movimientos comparten rollback o aislamiento en esta instalación; auditar triggers, accountability, recursión y efectos de escrituras anidadas antes de elegir Flow o extensión. [Triggers de Directus](https://directus.com/docs/guides/flows/triggers), [seguridad de Flows](https://directus.com/docs/guides/security/best-practices#flows).
- **No confundir UI con secreto:** ocultar montos del PDF es preferencia visual, no control de acceso; no entregar importes denegados aunque la casilla esté oculta. Reautorizar cada lectura/descarga y limpiar el estado al detectar revocación evita **nuevas** entregas, pero no borra bytes ya descargados ni garantiza retirar datos que un navegador conservó. La carga de firma y la escritura de orden pueden fallar por separado: definir staging/limpieza de archivos huérfanos con permiso adecuado y prueba de fallos antes de prometer guardado «sin cambios parciales».

## 4. Batches de implementación y aprobación

**Regla fundamental:** ejecutar **un batch por vez**, en el orden indicado. Al terminarlo, mostrar al usuario el resultado visible y las pruebas aplicables, incluidos fallos o límites; preguntarle explícitamente **«¿Este batch funciona correctamente o hay algo que corregir? ¿Aprobás avanzar al siguiente?»**. Si reporta un problema, reproducirlo, corregirlo dentro del batch y volver a verificar y preguntar. Si no aprueba, detenerse: ningún batch siguiente empieza por haber terminado las pruebas, por silencio ni por aprobación de este plan. Una aprobación de avance tampoco concede permisos para leer datos privados o modificar esquema, políticas, Flows o registros: pedir autorización específica cuando el batch la requiera. No marcar un batch completo con pruebas pendientes o denegadas; explicar el bloqueo y esperar decisión. §5 es la matriz de aceptación transversal, aplicada al batch que introduce cada conducta, no una única prueba al final. Cada batch que agrega UI incluye sus mensajes en español con el patrón de i18n de §3.6 y prueba también estados de carga, vacío, error y denegación aplicables; no se posterga la traducción para el final.

### Batch 0 — Contratos y viabilidad técnica (sin cambiar Directus)

Entregable para revisar: [contrato de órdenes e inventario y matriz de pruebas](area-privada-metrologia-batch-0.md). Su existencia no equivale a aprobación ni a pruebas remotas realizadas.

- **Hacer:** cerrar proyecciones mínimas de orden, relaciones, líneas, cargos/IVA, firmas previas y vínculo orden↔movimiento; documentar ejemplos de centavos para el redondeo ya aprobado de `ServiceOrderAmounts`, definir baseline neto y pruebas de permisos, rollback, idempotencia y concurrencia antes de proponer migración/Flow. Conservar las reglas de estados, cantidades, proveedores/clientes y pagos de §§3.8–3.9 sin reabrir decisiones ya tomadas. No inferir `scales.client` de órdenes históricas ni usar `consecutives`.
- **Comprobar:** contrato revisable que distinga campos existentes de propuestos y matriz A/B de operaciones permitidas/denegadas, efectos de stock y reparaciones. Permisos efectivos, usuarios, datos y configuración remota solo se consultan si el usuario autoriza ese acceso; una falta de evidencia no se presenta como garantía.
- **Cierre:** acordar correcciones o aprobar el paso al Batch 1. Ninguna migración ni cambio de Flow queda autorizado por aprobar este contrato.

### Batch 1 — Sesión y cliente Directus privado (implementado; cierre pendiente de evidencia del usuario)

**Estado: código completo y verificado localmente.** Toda la lista «Hacer» original está implementada (detalle exacto en §3.0, que prevalece sobre este resumen). Lo único que falta para cerrar el batch es la evidencia que solo el usuario puede producir en su entorno aislado:

- **Experimento 1 (protocolo ya redactado):** login/refresh/logout JSON reales contra el despliegue, incluyendo un usuario **sin rol** para comprobar el rechazo `noRole` antes de emitir cookies, y un intento fallido para comprobar `invalidCredentials`/`mfaRequired` en pantalla.
- **A/B integrado:** acceso anónimo y cruce A/B denegados; sitio público intacto; dos pestañas, respuestas de refresh fuera de orden, logout concurrente durante refresh, cambio de usuario, sesión expirada y varias instancias (single-flight no coordina réplicas: invalidar una solicitud solo mata la sesión de esa réplica).
- **Validaciones de despliegue:** confirmar que el proxy del proveedor sobrescribe `x-forwarded-for` (el rate-limit por IP depende de ello) y revisar `REQUESTS_EXCEEDED` / TTL de sesión en la configuración de Directus para alinear el refresh de 7 días anotado como shortcut.
- **Comprobar en pantalla:** textos españoles de formulario, validación, envío, expiración y denegación, sin claves visibles ni copy de Efferd. Si la renovación no resulta segura, cerrar sesión y pedir login; no declarar refresh transparente verificado.

- **Cierre:** con esos resultados redactados (sin secretos), corregir dentro del batch si aplica y pedir aprobación explícita del Batch 2. Ningún resultado favorable autoriza por sí solo el Batch 2.

### Batch 2 — Shell, dashboard y configuración (implementado; cierre pendiente de revisión visual del usuario)

**Estado: código completo y verificado localmente.** El detalle exacto está en el bloque homónimo de §3.0, que prevalece sobre este resumen. Dos desvíos documentados frente al texto original: **no se instalaron bloques Efferd** (composición propia con componentes locales; la URL del registro `@efferd` quedó sin corregir por no usarse) y el namespace de copy compartido es `app` (no `privateApp`).

- **Hecho:** shell con sidebar colapsable (grupos Operación/Catálogos, ítems deshabilitados hasta su batch con tooltip), menú de usuario en el pie del sidebar con logout real, dashboard con identidad degradada segura y `connection()` (fix del insight de prerender), configuración con tabs verticales — Apariencia (tamaño de fuente segmentado + movimiento reducido, preferencias locales en `localStorage`) y Perfil (6 campos editables con TanStack Form + valibot, botón sin cambios deshabilitado, foto de perfil con recorte circular y subida a `directus_files` vía `uploadAvatar`), capa de dominio de sesión (tipos/fields/query/repositorio, sin SDK en componentes), i18n `dashboard`/`app` registrados, eliminación del texto «Área privada».
- **Comprobar (pendiente del usuario):** revisión visual y funcional con sesión real (perfil, foto con recorte, avatar en el menú, preferencias); **A/B de escritura de `directus_users`** — la edición de perfil solo está probada con mocks y no se cierra como operativa hasta probar permisos efectivos y límites de campos; rutas deshabilitadas del sidebar inaccesibles por URL directa (sus páginas llegan en Batches 3+; hoy no existen).
- **Cierre:** con la revisión visual del usuario; corregir dentro del batch o aprobar Batch 3. La escritura de perfil no se declara cerrada hasta la prueba A/B de permisos.

### Batch 3 — Lecturas privadas y listados

- **Hacer:** tipos de campos existentes de `order` en `types/schema.ts`; `*.fields.ts` y consultas/repositorio privados por uso para listado y detalle **solo con campos existentes**. La proyección completa a `ServiceOrderData` se pospone hasta disponer del modelo propuesto en Batch 4; no mapear líneas, importes o relaciones inexistentes a vacíos ficticios. Lecturas explícitas de clientes, básculas, inventario, movimientos y catálogos necesarios; listados, búsqueda en todo el conjunto autorizado, paginación y URL mediante nuqs según §3.6. El filtro de básculas por cliente y el origen de movimientos se habilitan solo después de existir los vínculos de Batch 4. Crear y registrar `i18n/messages/es/metrology.json` al introducir estas pantallas, con grupos para las tareas que se implementen, no mensajes especulativos. No convertir 403 en `[]` ni usar caché/cliente público.
- **Comprobar:** A/B, filas/campos/relaciones ocultos y URL directa; vacío real frente a denegación/caída; filtros que sí tienen datos de soporte y fechas `America/Mexico_City` con límites de día locales convertidos a intervalo UTC semiabierto, página 1 al cambiar filtro, tabla/lista accesibles y regresión pública. No presentar la proyección PDF como preparada ni habilitar filtros que dependen de vínculos ausentes.
- **Cierre:** evaluar datos y navegación reales con el usuario; corregir o aprobar Batch 4.

### Batch 4 — Modelo persistente y garantías de backend

- **Hacer, solo con autorización específica de Directus:** incorporar `scales.client` nullable, líneas de refacciones, cargos/IVA y vínculo movimientos↔orden, además del mínimo almacenamiento verificable de nombres previos. Diseñar expansión compatible, respaldo y reversión que no elimine datos nuevos; definir y probar guards API/Studio de relaciones, cantidades y campos necesarios para los CRUD posteriores, sin migrar dueños por inferencia ni alterar el Flow existente sin autorización puntual. Bloquear provisionalmente por API/Studio los cambios directos de `order.status` hacia estados que producen efectos no implementados; mantenerlos bloqueados hasta implementar y probar enforcement completo en Batch 7. Si falta autorización para ese guard, no cerrar Batch 4 ni habilitar operaciones que lo presupongan. Preferir Flows solo si se prueban atomicidad/idempotencia/concurrencia; si no, detenerse antes de optar por extensión.
- **Comprobar:** migración y recuperación en entorno aislado, lectores anteriores y nuevos funcionando durante despliegue mixto; registros legados preservados; API/Studio rechazan transiciones todavía no implementadas, entradas inválidas y contenido no-draft en las rutas ya habilitadas sin cambios parciales. Las pruebas aisladas de escritura API antes diferidas requieren permiso explícito; sin ellas este batch queda bloqueado, no «aprobado por diseño». Atomicidad de pagos y concurrencia entre transiciones son puertas adicionales de Batch 7, no se dan por probadas al crear campos.
- **Cierre:** enseñar el esquema y evidencia de integridad; corregir o pedir aprobación del Batch 5, sin asumir permisos para mutaciones posteriores.

### Batch 5 — Catálogos de apoyo

- **Hacer:** CRUD acotado de clientes, básculas, inventario, marcas, modelos y proveedores conforme a §3.8; páginas de detalle para los tres primeros y diálogos breves para los últimos. Activar aquí el filtro de básculas por `scales.client` introducido en Batch 4. Respetar `scales.client` y selección de básculas por cliente; no crear un CRUD genérico ni pantallas para uniones.
- **Comprobar:** A/B por acción/campo, ausencia de borrado físico por personal, referencias legadas sin cliente no seleccionables, búsqueda/paginación completa y rechazo de cambios inválidos sin escrituras parciales.
- **Cierre:** probar con el usuario los flujos útiles; corregir o aprobar Batch 6.

### Batch 6 — Movimientos independientes y correcciones

- **Hacer:** listado y formulario de movimientos con stock antes/después, origen y enlace habilitados al existir el vínculo de Batch 4; creación general siempre independiente. Entrada con preview+Guardar, retirada y edición existente con confirmación. `entry` exige proveedor real y `withdrawal` cliente real, sin excepciones por status; préstamos y devoluciones siguen §3.8. Movimientos vinculados solo se corrigen desde detalle de orden, con vínculo fijo y permiso efectivo, cuando ese flujo exista en Batch 7.
- **Comprobar:** API/Studio y Next.js rechazan tipo/relación ausente, cambio de tipo inválido y retiro sin cliente; permiso de crear independiente sin permiso de pagar; validación de stock y ausencia de efecto parcial. Si las pruebas de escritura remota siguen diferidas, no habilitar mutaciones ni cerrar el batch.
- **Cierre:** revisar movimientos y sus efectos con el usuario; corregir o aprobar Batch 7.

### Batch 7 — Transiciones y conciliación de órdenes

- **Hacer:** ciclo `draft`/`paid`/`cancelled` de §3.9 con validación también por API/Studio; baseline atribuible, conciliación/compensación, detección de movimientos modificados o eliminados y reparación estrecha. Pagar con movimientos exige ambos permisos efectivos; sin movimientos, no exigir creación innecesaria. Draft no reserva stock; stock insuficiente bloquea todo.
- **Comprobar:** cada transición y reintento, permisos faltantes por separado, stock/estado sin efectos parciales, operaciones simultáneas con inventario compartido, reparaciones y discrepancias bloqueantes. Probar que actualizaciones directas por API/Studio y por Next.js pasan por la misma regla, que un fallo intermedio revierte orden, movimiento y stock y que dos pagos concurrentes no duplican salidas. Una prueba de UI no sustituye atomicidad/rollback de varias escrituras ni enforcement externo a Next.js; sin prueba, no habilitar pago/cancelación.
- **Cierre:** confirmar resultados y casos de falla con el usuario; corregir o aprobar Batch 8.

### Batch 8 — Editor de orden y firmas

- **Hacer:** detalle con preview a la izquierda y «Editar» abajo a la derecha que abre formulario desde la derecha (drawer móvil). Implementar y validar aquí la proyección completa `ServiceOrderData` sobre el esquema ya disponible y un transporte acotado de bytes de firmas privadas para el preview autorizado, separados de la posterior reautorización para descargar. Editar contenido solo en draft, validar cliente↔básculas al guardar sin borrar selecciones incompatibles, exigir campos/ambas firmas y al menos una báscula, permitir cero refacciones. Capturar trazos con `SignaturePad`, cargar PNG transparente autorizado a `directus_files`; mostrar firma actual y solo nombre anterior. Preview local advierte cambios sin guardar; todavía no habilita descarga.
- **Comprobar:** guardados válidos/rechazados sin efectos parciales, incluidos fallos tras subir una firma (sin archivos huérfanos accesibles ni reemplazo silencioso), permisos y estado en servidor, transporte privado de firma con tipo/tamaño acotados y sin URL pública, reasignaciones, firmas exigidas por cambio de firmante, transparencia real del PNG, foco/Escape/drawer móvil y nuevas lecturas de preview bloqueadas al detectar revocación. No mostrar edición normal en paid/cancelled.
- **Cierre:** probar la edición completa con el usuario; corregir o aprobar Batch 9.

### Batch 9 — PDF privado y acciones del detalle

- **Hacer:** integrar el prototipo pdfcn/Forme con datos guardados: por cada abrir/descargar, servidor reautoriza orden y assets con identidad individual, valida proyección y entrega solo lo necesario; reutilizar o ajustar el transporte privado probado para preview en Batch 8. Browser genera PDF en memoria, sin persistirlo. Barra superior solo Descargar PDF, Compartir y Abrir PDF en nueva pestaña. **Compartir copia el enlace privado al detalle**; quien lo abre se autentica y solo ve la orden si sus permisos propios lo permiten. No adjuntar ni compartir el PDF como archivo, ni crear un enlace de Directus que eluda permisos. Route Handler solo ante límite medido del browser.
- **Comprobar:** A/B y revocación entre preview y descarga, transporte acotado de bytes privados con tipo/tamaño validado y limpieza, nueva pestaña sin URL/token público ni ventana persistente tras un fallo, ausencia de PDF parcial/URLs públicas de firmas, borrador guardado frente a cambios locales, estados y precios ocultos por defecto, NULL/0.00, firmas transparentes, 1–5 básculas, 4/5 refacciones, texto largo y móvil; medir WASM/bundle/memoria. La cuarta fila del prototipo aún espera verificación independiente autorizada: no tratar esa prueba pendiente como aprobada por esta planificación.
- **Cierre:** demostrar descarga/compartición autorizadas con el usuario; corregir o declarar el alcance de órdenes aceptado. No pasar automáticamente a `traceable`/`accredited`.

### Batch 10 — Evaluación opcional posterior, separada

Solo si el usuario pide un nuevo alcance: investigar `traceable` y `accredited` por separado, identificar fuentes reales y proponer nuevos batches antes de construir cálculos, informes o aprobaciones. El esquema consultado hoy solo acredita campos de auditoría; `consecutives` sigue excluida. La aprobación del Batch 9 no autoriza iniciar este trabajo.

## 5. Pruebas de aceptación imprescindibles

Aplicar las pruebas siguientes en el **batch que introduce cada comportamiento** y mostrar resultados/faltantes al pedir aprobación; no posponer los riesgos de seguridad o stock al final. Las pruebas con mocks sirven para desarrollo, no sustituyen la evidencia A/B y de API en entorno autorizado para cerrar el batch correspondiente. En cada batch con interfaz, verificar los mensajes `next-intl` en español, sus namespaces registrados en `i18n/request.ts`, etiquetas accesibles, carga/vacío/error/denegación pertinentes y ausencia de claves sin resolver o textos de ejemplo de Efferd; aprovechar `directusErrors`, `search` y `share` donde ya expresen el mismo concepto.

Además de validar UI responsive/configuración, probar búsqueda compartida de órdenes en todo el conjunto autorizado y paginación, sin exponer filas no autorizadas. Confirmar vista/filtros/estado/búsqueda/página en URL vía nuqs, cambios de filtros a página 1 y cambio de pestaña preservando búsqueda y fecha; tabla móvil desplaza solo su panel. Probar «Requiere corrección» (solo referencias ausentes/discrepancia confirmadas), indicador separado «No se pudo verificar» por permiso y no filtrado como corrupción, sin PDF/transición ante integridad desconocida ni detalles no autorizados. Verificar filtros por módulo descritos en §3.6, búsqueda sobre todos los autorizados, no solo página, y límites de exposición de nombres en URL/historial/logs. Probar fechas de orden por calendario `America/Mexico_City`, independientemente de timezone del dispositivo.

Con dos cuentas de prueba, **A y B**, cuyos permisos reales sean diferentes; estos son identificadores de prueba, no roles propuestos:

- A puede leer una orden O1; B no.
- A abre el detalle y descarga su PDF mediante la operación de servidor propuesta.
- B solicita **directamente** la URL de O1 y la operación de descarga: no recibe datos, assets autorizados ni bytes del documento.
- B conserva acceso a las órdenes que sí tenga permitidas.
- Ambos tienen diferencias comprobables de campos o relaciones: el PDF no recupera lo oculto mediante el token público.
- Visitante anónimo: redirección al login en páginas y rechazo no autorizado de la operación de descarga.
- O1 inexistente o no visible: respuesta que no revele su existencia.
- Al elegir cliente A, mostrar solo sus básculas; sin cliente asignado no aparecen. Cliente B con báscula de A: incompatibilidad visible, sin borrado silencioso; no guardar ni presentar PDF como válido. Cambiar la relación mientras se edita: rechazo completo por validación del servidor.
- Crear/editar según permisos efectivos de A y B; personal no puede borrar físicamente ningún registro, incluidos movimientos. Solo administrador autorizado puede borrar excepcionalmente. Probar que rechazo no se elude por URL/relación ni se convierte en lista vacía.
- Movimientos: filtros status/origen/artículo/fecha; página completa con stock anterior/posterior previsto; confirmar retirada nueva y cualquier edición existente; entrada nueva solo preview+Guardar; servidor revalida. Lista general muestra autorizados con origen/enlace, los vinculados read-only; editar/corregir desde detalle de orden con vínculo fijo validado server-side; creación general sin orden y sin requerir permiso de pago, pero sí permiso efectivo de creación de movimientos. Tipo explícito, notas opcionales. Loan usa retiro nuevo/status loan y devolución nueva entry/status loan, conservando el original, sin emparejamiento inferido; `returned` sigue siendo devolución defectuosa a proveedor. Sin relación/saldo/guardia exceso. Para todo status, entry requiere supplier real y withdrawal requiere client real; un retiro independiente por pérdida interna/baja `damaged`/`decommissioned` sin cliente real se rechaza. En pago que requiera movimientos, probar que la falta de cualquiera de los permisos efectivos (pago de orden o creación de movimientos) rechaza el pago entero sin cambios parciales de stock, estado ni visibilidad; cubrir pago sin movimientos necesarios, donde no debe exigirse permiso de creación no usado. El usuario difiere las pruebas aisladas de escritura API para después: no están hechas ni se consideran aceptadas como hechas. Cuando se autoricen, cubrir cambio de tipo en update, relación ausente/null, tipo inválido y cliente derivado de orden vinculada cuando aplique; no inventar reglas para ese cliente.
- Contenido normal solo se edita en `draft`; reparación estrecha de relaciones/datos faltantes se permite con permiso efectivo, incluso no-draft, pero no da edición general. Cada guardado requiere campos obligatorios, ambas firmas y báscula; sin intermedios inválidos. Decisiones: `cancelled → paid` directo permitido; paid→draft conserva movimientos del último pago confirmado; repago reconcilia delta; paid→cancelled compensa neto; cancelled→paid reconcilia desde neto atribuido. Personal puede editar movimientos con permiso, no borrarlos físicamente; borrado excepcional solo admin autorizado. Desviación en movimiento atribuido bloquea pago/cancelación/PDF hasta compensación y reconciliación automática; draft puede reabrirse/editar, baseline no cambia. Reintentos, atomicidad, detección, vínculo y concurrencia requieren prueba. Stock insuficiente rechaza pago sin parcialidad.
- El usuario difiere expresamente para más adelante las pruebas aisladas de escritura API y la demostración de enforcement server-side por Studio/API; no se han realizado. Mantener como verificaciones futuras, separadas de las pruebas de UI/servidor Next.js, que status aplique validaciones/efectos de stock y que contenido no-draft en `order_scales` y futuras líneas se rechace salvo reparación autorizada y acotada. También quedan por probar atomicidad/rollback y concurrencia en esta instancia; documentos de Directus no son evidencia suficiente.
- Revocar permisos entre abrir detalle y descargar: la operación de servidor reautoriza y vuelve a leer la orden guardada y los archivos necesarios; el navegador no descarga desde preview local ni desde datos antiguos. Denegación, relación rota o dato requerido ausente bloquean todo el PDF, sin documento parcial; invalidar preview visible al detectar el cambio. Enviar al cliente solo datos/assets autorizados mínimos; nunca URL pública de firma. Verificar que no haya **nuevas lecturas ni descargas** tras revocación ni persistencia del PDF por la aplicación; no prometer borrado de bytes ya recibidos o copias que el usuario guardó. Renderizado browser probado solo en Storybook con datos sintéticos; medir en la integración real WASM, bundle, memoria, transferencia de assets y seguridad. Solo si esas mediciones muestran un límite concreto, evaluar Route Handler como alternativa.
- PDF siempre indica estado; watermark de cancelada opcional; UUID completo. Datos no monetarios visibles por defecto, monetarios ocultos por defecto; controles individuales y «ocultar todos» cubren cada monto. No persistir visibilidad ni transformar denegación en ocultamiento. Precio NULL da fila/importe/totales derivados en blanco; cargo 0.00 visible da $0.00. Paid/cancelled descargables; draft se descarga desde datos guardados en servidor, mientras preview local avisa de cambios sin guardar.
- Probar firmas: `SignaturePad` produce PNG de trazos con alfa transparente (sin fondo del pad), se carga con permisos al archivo correspondiente en `directus_files` y se renderiza sin fondo añadido en el PDF; no equivale a la descarga local incorporada. Mostrar firma actual y nombre del firmante previo, nunca imagen previa; cambio real de firmante exige firma nueva. Verificar el almacenamiento propuesto de nombres previos, sin asumir campo/revisions ya existentes.
- Ejecutar solicitudes A/B intercaladas: el cliente público de `config/directus-public.ts` sigue sirviendo al sitio sin sesión; las solicitudes privadas usan instancias/credenciales individuales, sin contaminación de cliente, caché o estado. Verificar que la proyección `ServiceOrderData` no incluya campos denegados ni convierta datos obligatorios ausentes en un PDF aparentemente válido.
- Expirar acceso, renovar, usar refresh inválido y simular Directus caído.
- Dos pestañas renovando; refresh simultáneo con logout; respuestas fuera de orden.
- Cambio de usuario en el mismo navegador y navegación atrás: sin datos privados residuales.
- POST desde otro origen y manipulación del destino de retorno: rechazados.
- PDF con texto largo, caracteres españoles y todas las básculas; tratar por separado báscula inactiva pero válida, parte archivada vinculada, parte/client/scale faltantes y scale reasignada a otro cliente. Parte archivada sigue visible y puede cambiarse en draft; no es nueva seleccionable. Relación rota bloquea edición/PDF hasta reparación válida, sin cascada silenciosa.
- Probar reparación de referencia por personal con permiso efectivo incluso no-draft, sin permitir edición general no-draft; parte pagada sustituida requiere compensar viejo retiro y debitar sustituta con stock disponible. Falta de permiso o stock mantiene bloqueo. Cambiar receptor exige nueva firma cliente; cambiar técnico, firma técnica; cliente pagado sustituido, ambas; báscula bajo mismo cliente no requiere re-firma. El PNG de `SignaturePad` debe conservar alfa transparente en el archivo y el PDF; su descarga local no equivale a carga autorizada en Directus. Mostrar la imagen de la firma actual y solo el nombre del firmante inmediatamente anterior, nunca su imagen; usar el texto exacto «Anteriormente se habia firmado por: » con estilo pequeño muted y atribución correcta. Cambio real de firmante requiere nueva firma. Persistencia de nombres previos es propuesta mínima pendiente de confirmar con metadatos; no asumir campos/revisions existentes.
- Verificar que generar y descargar no crea archivos, relaciones, registros ni cambios de numeración en Directus.
- En detalle de orden, probar preview a la izquierda en escritorio, apertura/cierre/foco del panel derecho mediante «Editar» abajo a la derecha, adaptación móvil, estado no editable y aviso de cambios sin guardar. La barra superior solo contiene Descargar PDF, Compartir y Abrir PDF en nueva pestaña; comprobar autorización nueva para abrir/descargar y que compartir no publique datos ni otorgue permisos. Probar dashboard/configuración adaptados a módulos reales, sin contenido de soporte ajeno, y login existente conectado antes de aplicar `polish`.
- Regresión del sitio público y accesibilidad por teclado/móvil.

Primero se pueden usar mocks deterministas; **no sustituyen** las pruebas posteriores contra permisos reales en un entorno autorizado.

## 6. Históricos y validación pendiente

**Consultar datos históricos no equivale a reproducir exactamente un PDF anterior.**

Un PDF regenerado con datos actuales cambia si cambia la orden o la plantilla. Para reproducción exacta harían falta revisiones inmutables de datos, plantilla y recursos —o conservar el documento—. No se incorpora al alcance decidido; solo se reconsideraría si el usuario lo solicita explícitamente más adelante.

### Verificaciones no realizadas

**Actualizado al avance de Batch 2 (2026-11-12).** Nuevas verificaciones desde el cierre de Batch 1: suite completa **101/101** (23 archivos; se sumaron los 14 tests de `profile.test.ts` — actualización de perfil, validación de etiquetas, límites de subida de avatar y claves de error —), `tsc` limpio, ESLint sin errores, Prettier y `git diff --check`; verificación visual del shell y la configuración con Playwright (tabs verticales, cambio de pestaña, avatar con fallback, 0 errores de consola propios; capturas en `odd/evidence/`). De Batch 1 se conservan: suite 87/87, verificación independiente en copia aislada 70/70 + typecheck (scratch eliminado). Siguen sin realizarse:

- **Revisión visual de Batch 2 con sesión real** (la ejecuta el usuario; ver Batch 2 en §4): perfil, foto con recorte y subida, avatar en el menú, preferencias persistentes.
- **A/B de escritura de `directus_users`:** la edición de perfil y `uploadAvatar` solo están probadas con mocks; faltan permisos efectivos y límites de campos contra Directus.
- **Experimento 1 y A/B integrado de Batch 1** (los ejecuta el usuario; ver Batch 1 en §4): login/refresh/logout reales, usuario sin rol, carreras de refresh, logout concurrente, cambio de usuario, múltiples instancias.
- **Validaciones de despliegue:** sobrescritura de `x-forwarded-for` por el proxy del proveedor; TTL de sesión y `REQUESTS_EXCEEDED` reales en Directus para alinear el refresh de 7 días (hoy un shortcut anotado).
- Snapshot/export local (no localizado). **El esquema vivo básico de `order`, `scales`, `traceable` y `accredited` sí se verificó por MCP**, pero no sus registros, datos históricos ni consistencia efectiva.
- Roles, políticas, MFA, TTL, versión y configuración efectiva de Directus (más allá del gate de rol por `readMe`, ya implementado y probado con mocks).
- Identidad y privilegios del token público.
- Integración Next.js del renderizado y descarga privada, paginación con contenido largo, memoria y empaquetado WASM. El renderizado y casos acotados de paginación sí se probaron en Storybook; la cuarta fila aún no pasó una verificación independiente (0 pruebas ejecutadas por fallo de preparación).
- Build Next.js de la aplicación con el área privada conectada (no ejecutado en esta tarea; `pre-deploy` queda a cargo del usuario).

En la investigación inicial funcionó CodeGraph; la revisión posterior lo contrastó con Git y lecturas locales (757 archivos indexados, con advertencia de algún vínculo pendiente de sincronización). Directus Documentation MCP aportó documentación pública; **Directus MCP**, autorizado posteriormente por el usuario para investigar el esquema, aportó metadatos vivos mediante `schema`, `fields`, `relations` y `collections`, siempre en modo lectura. Ninguno de esos metadatos prueba los permisos de las cuentas de empleados.

### Estado de decisiones y pendientes

### Decisiones de producto confirmadas

`cancelled → paid` directo sí está permitido; ya se resolvieron descuentos, obligación de precio y borrado por personal. También están cerradas las reglas de estados, reparaciones, movimientos, firmas, monetización, PDF y referencias descritas en §3.9. La composición dashboard/sidebar, vistas, pestañas, búsqueda/paginación, catálogos, perfil y preferencias de §§3.6–3.8 se confirmaron en esta sesión.

### Decisiones confirmadas: movimientos y permisos

Todo `entry` requiere proveedor real y todo `withdrawal` requiere cliente real, sin excepciones por `status`; `entry/status=loan` requiere supplier y `withdrawal/status=returned` requiere client, no supplier. Un `withdrawal` independiente por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real se bloquea. No inventar identidades ni presumir vínculo entre entrega y devolución de préstamo. Un movimiento independiente puede crearse sin orden por personal con permiso efectivo de creación; no requiere permiso de pago y su enlace a orden permanece vacío. Para pagar una orden que requiera movimientos deben coexistir permisos efectivos de pago de orden y creación de movimientos; la ausencia de cualquiera rechaza el pago completo sin efectos parciales. Si el pago no necesita crear movimientos, no hace falta permiso de creación no utilizado. La metadata condicional de Studio no demuestra enforcement API. El usuario difiere expresamente para más adelante las pruebas aisladas API y la prueba de enforcement server-side; siguen pendientes, no realizadas.

### Próximo trabajo: validación técnica, con autorización correspondiente

1. Diseñar/probar vínculo orden↔movimiento, baseline confirmado, detección de edición/borrado, compensación, atomicidad, idempotencia, concurrencia y desbloqueo automático; verificar permisos efectivos de Directus/Flow y no eludirlos. Para pagar con movimientos, exigir los permisos efectivos de pago y creación; para movimientos independientes sin orden, solo el permiso efectivo de creación.
2. Probar stock entero/no negativo y rechazo íntegro ante insuficiencia o falta de cualquiera de los permisos requeridos, incluida sustitución de parte pagada. No exigir permiso de creación en pagos que no necesiten movimientos.
3. Resolver técnicamente historial/nombre de firmantes previos y acceso a firmas, carga autorizada del PNG transparente de SignaturePad a Directus, selección de esquema y prueba del redondeo monetario aprobado e integrar/medir el PDF en la aplicación privada; el renderizado aislado en Storybook ya se probó, pero la cuarta fila requiere una nueva verificación independiente autorizada tras preparar el entorno aislado. Route Handler solo ante limitación medida. No afirmar que revisions conservan archivos accesibles.
4. Verificar permisos efectivos, API enforcement, versión/configuración Directus y sesión solo con autorización específica. Las pruebas de escritura API/enforcement están expresamente diferidas por el usuario para una continuación posterior; no presentarlas como realizadas. No consultar datos/usuarios/políticas ni editar Directus.
5. `json` ya está elegido y `session` descartado por dominios distintos ([auth-sso](https://directus.com/docs/configuration/auth-sso)); quedan por validar carreras/rotación integradas y MFA. Browser es la propuesta preferida de PDF, pero el preview y descarga con datos privados aún deben probarse fuera de Storybook. Preview local puede reflejar ediciones no guardadas, nunca ser fuente de descarga. Histórico PDF inmutable no está acordado.
6. En una continuación autorizada, implementar y probar enforcement server-side de la regla resuelta: `entry` requiere supplier real y `withdrawal` requiere client real, cualquiera que sea `status`; rechazo de retiros independientes `damaged`/`decommissioned` sin cliente real; y permisos efectivos combinados para pago con movimientos. Las pruebas de API aisladas —expresamente diferidas, no realizadas— deben cubrir cambio de tipo en update, relación ausente/null, tipo inválido, pago con falta de cada permiso y creación independiente sin orden; incluir cliente derivado de una orden vinculada cuando aplique, sin inventar reglas adicionales. La lista general de movimientos vinculados ya es read-only; edición/corrección desde detalle de orden.

No se autoriza implementar código ni modificar esquema, datos, políticas o Flows. Flow dedicado de orden sigue sin decisión ni autorización. El cambio previo del Flow activo de cantidad fue autorizado, aplicado y leído de vuelta; la prueba satisfactoria reportada por el usuario no sustituye evidencia de logs/stock ni pruebas independientes.

La autorización anterior de MCP cubrió metadatos de esquema y lectura/actualización autorizada del Flow existente. Esta edición documental no crea ni modifica nada en Directus. Distinguir la regla confirmada de cliente/proveedor por tipo, la configuración de Studio y el enforcement API todavía no probado.

### Restricciones que se mantienen

- Autenticación y sesiones únicamente con Next.js y el SDK oficial de Directus; sin Better Auth, Auth.js, iron-session u otras bibliotecas externas de autenticación.
- Reutilizar dependencias de PDF y componentes pdfcn instalados, sin asumir disponibilidad de todo el catálogo.
- Reutilizar componentes y patrones existentes; sin funcionalidades ni abstracciones especulativas.
- No sacrificar seguridad, autorización, manejo de errores ni accesibilidad.
- Sin registro público de usuarios.
- Sin build en esta tarea.
- La autorización de lectura de metadatos del esquema y actualización puntual del Flow de cantidad ya fue ejercida. No implica autorización para más cambios de Directus. Para acceder a datos, usuarios, políticas, credenciales o sesiones se requiere autorización explícita para ese alcance; nunca leer ni mostrar secretos.

**Riesgo principal:** permisos y sesión, integridad cliente-básculas, stock, enforcement API de cliente/proveedor e idempotencia/concurrencia de movimientos. Deben comprobarse con usuarios distintos y datos aislados antes de habilitar operaciones privadas. La ubicación de edición de movimientos vinculados ya está resuelta.

## 7. Prompt para retomar en otro equipo

Este documento es la fuente del plan; no copiar una segunda versión de las decisiones en un prompt porque se desactualiza. Las capturas y `order.jpg` citadas arriba estaban fuera del repositorio en la sesión original; solicitarlas de nuevo **solo** si una comparación visual las requiere.

```text
Quiero continuar el plan del área privada de metrología. Leé AGENTS.md, las reglas aplicables y docs/plans/area-privada-metrologia.md completo. Verificá el estado actual del árbol, las versiones instaladas y qué evidencia histórica sigue vigente; no atribuyas datos de Directus a una consulta nueva.

Antes de implementar, mostrame el batch exacto y sus dependencias. Ejecutá un solo batch autorizado por vez; al cerrarlo mostrá resultado, pruebas, límites y preguntá si funciona, qué corregir y si apruebo el siguiente. El silencio o las pruebas exitosas no autorizan avanzar. No confundas la aprobación del plan/batch con permiso de leer datos privados o modificar esquema, políticas, Flows o registros de Directus: pedí autorización puntual antes de cada acceso o escritura relevante. No accedas a secretos.

Respetá las decisiones confirmadas en §§3.6–3.9, las puertas de §3.10, los Batches 0–10 de §4 y la matriz de §5. No implementes traceable/accredited sin un pedido nuevo; no uses consecutives. El documento separado de errores/logger mencionado en el histórico no está en este árbol: no lo des por disponible. La verificación independiente pendiente del PDF ejecutó 0 pruebas; no la reintentes sin solicitud expresa. Preservá cambios ajenos y no publiques ni hagas commits sin mi pedido.
```
