# Plan para el área privada de metrología

Estado: investigación y decisiones de producto; **no autoriza implementar código, modificar el esquema/Flows de Directus ni leer registros privados**. El manejo de errores y el logger se planifican por separado en [directus-errors-logger.md](directus-errors-logger.md).
Alcance: área privada para gestionar órdenes de servicio y las colecciones que realmente facilitan ese trabajo, mediante permisos individuales efectivos. `traceable` y `accredited` se evalúan después; `consecutives` permanece excluida.

**Lectura rápida:** el esquema vivo confirma `order`, `order_scales`, `scales`, `clients`, `inventory` e `inventory_movements`; el usuario creó `order.status` (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`) y confirma que aún no hay órdenes, sin lectura de registros. El modelo de líneas de refacciones sigue sin crearse; la relación `scales.client` y el vínculo de movimientos a órdenes también faltan. `inventory.price` sí existe: decimal(10,2), nullable, default `NULL`. Están acordados los campos/requisitos de guardado, cargos, IVA y presentación PDF descritos abajo. Sigue sin respuesta si se permite `cancelled → paid` directamente o si debe pasar por `draft`. No se verificaron políticas efectivas ni renovación concurrente de sesiones.

### Decisiones confirmadas (fuente: conversación con el usuario)

- **Regla transversal a documentos:** su contenido solo se puede editar cuando el documento está en `draft`. Desde cualquier otro estado se puede volver a `draft` mediante un cambio explícito si la persona tiene permiso; mientras tanto, la edición de contenido sigue bloqueada. Esto no presupone que `traceable` o `accredited` ya tengan campo de estado: todavía no lo tienen en el esquema consultado, y su diseño queda para más adelante.
- Next.js + SDK oficial de Directus, sesión por persona; Directus gobierna permisos de filas/campos/operaciones. El usuario administra roles y políticas; no codificar el rol «Técnico» ni usar el token público para operaciones privadas. Sin registro público.
- CRUD de órdenes y colecciones útiles para gestionarlas (clientes, básculas, inventario y movimientos, entre otras según tareas concretas), más perfil propio; una colección nueva no implica necesariamente una pantalla propia. El CRUD manual de movimientos de inventario, incluso los originados en órdenes, está permitido si el usuario tiene permisos; se prefieren correcciones compensatorias, pero falta diseñar cómo repercuten en la conciliación de la orden.
- `scales` representa básculas de clientes; `inventory.type = equipments` representa existencias y no debe confundirse con esas básculas. Se necesita una relación `scales.client → clients`, **opcional para los registros ya existentes**: una báscula sin cliente no aparece en el selector. No inferir dueño a partir de órdenes históricas.
- En el editor de orden, elegir cliente filtra las básculas disponibles. Si se cambia el cliente con básculas seleccionadas, conservarlas y señalarlas como incompatibles en el borrador; bloquear el guardado (y no presentar un PDF válido de esa combinación) hasta quitarlas/reemplazarlas o restaurar el cliente previo. Revalidar todas las relaciones al guardar, sin cambios parciales.
- Editor en escritorio con formulario a la izquierda y preview del PDF del borrador a la derecha; en móvil el formulario se abre en `components/ui/drawer.tsx`. Descarga del PDF actual en memoria, sin almacenarlo en Directus; la imagen de referencia `C:\Users\benog\Downloads\order.jpg` fija el aspecto, y los ocho logos WebP están en `assets/logos/pdf`.
- `order.folio` es UUID, **no** un consecutivo numérico. Para cualquier guardado, sin importar estado, deben estar presentes todos los campos requeridos de la orden, incluidas ambas firmas, y al menos una báscula; cero refacciones sí es válido. `description` es un texto general de servicio compartido por todas las básculas. `order.date_created` es la fecha que se imprime; nombre del receptor y departamento se capturan manualmente en los campos existentes. Estos requisitos de producto no prueban que la API actual los imponga.
- `inventory.price` existe ahora: metadatos de Directus verificados como decimal(10,2), nullable, default `NULL`; no se requiere en la UI del inventario. Se usa el precio actual de `inventory` (no un precio histórico copiado a la orden), en MXN con dos decimales. Una línea por artículo y cantidad entera positiva; el modelo de líneas sigue propuesto, no creado. El stock no se reserva ni descuenta mientras la orden está en `draft`.
- `draft → cancelled` está permitido. El paso `draft → paid` confirma el pago y dispara el descuento de inventario; no se requieren fecha, monto ni método de pago adicionales. Para editar una pagada, primero pasarla a `draft`, **conservando las salidas originales**; al repagar, conciliar solo la diferencia por artículo. Una orden pagada no se elimina físicamente: se cancela compensando el saldo neto. `order.status` existe con valores **`draft`, `paid`, `cancelled`**, default `draft` y columna no nullable. `cancelled → draft` está permitido, aunque normalmente se prefiere crear otra orden. Si se permite `cancelled → paid` directo sigue **sin respuesta**. El usuario afirma que el historial de cancelación ya existe en el backend: **no agregar historial duplicado en esta área**. No se autoriza modificar otros aspectos del servidor.

## 1. Veredicto de viabilidad

**Es técnicamente viable con las dependencias instaladas**, sin agregar una biblioteca de autenticación ni un servicio externo de PDF.

La propuesta mínima es:

- Next.js como intermediario entre el navegador y Directus.
- Autenticación individual con el SDK oficial de Directus.
- Sesión mediante cookies `HttpOnly`, con modo y responsable de emisión por decidir tras una prueba de integración.
- Autorización efectiva en Directus para cada consulta, con credenciales individuales del empleado.
- CRUD de órdenes y recursos relacionados por etapas, sin duplicar colecciones de Directus ni permisos en Next.js.
- Editor de orden y PDF de borrador/descarga final en memoria con Forme y componentes pdfcn locales, sin subir archivos a Directus.
- Navegación interna inspirada en shadcn/ui, adaptada a los componentes React Aria existentes y a las tareas efectivamente disponibles.

**La viabilidad está condicionada a verificar políticas y sesiones reales.** Una consulta posterior, autorizada expresamente por el usuario, confirmó mediante el MCP de Directus la existencia y el esquema de `order`, `traceable` y `accredited`. No se encontró snapshot local ni soporte tipado o consultas de metrología en Next.js; eso es una carencia del frontend, no del servidor.

La investigación original fue local y de solo lectura; en la revisión posterior se consultaron exclusivamente metadatos del servidor con operaciones de lectura (`schema`, `fields`, `relations`, `collections`). No se leyeron registros, usuarios, políticas, archivos ni secretos. El árbol local **ya no está limpio**: contiene cambios ajenos a esta actualización, que no se atribuyen ni se revierten aquí. Esta edición solo actualiza el plan solicitado.

Las referencias a líneas reflejan el estado inspeccionado y pueden desplazarse con cambios posteriores.

## 2. Hallazgos verificados

### Cliente Directus y consultas actuales

El cliente de `config/directus.ts:1-24`:

- Es exclusivamente de servidor.
- Usa `createDirectus<Schema>()`, `staticToken()` y `rest()`.
- Obtiene URL y token de variables de entorno.
- Aplica un timeout de diez segundos.

Los nombres de esas variables están en `lib/env/constants.ts:1-5`. Se leyeron las referencias del código, no los valores de `.env`.

Ese cliente abastece consultas públicas de páginas, productos, clientes, navegación y otros recursos. Por ejemplo, `services/domain/db/queries/collections/clients/clients.ts:21-33` utiliza `"use cache"` y una vida de caché de minutos.

**Consecuencia:** preservar el cliente actual y sus consumidores. No llamar `setToken()` sobre ese singleton para introducir la sesión de un empleado: produciría estado compartido entre solicitudes y podría alterar el sitio público.

Se puede reutilizar el patrón de archivos `*.fields.ts`, consultas y repositorios, pero **no copiar su caché compartida ni convertir errores privados en listas vacías**. La clasificación, los mensajes i18n y el logger se investigan por separado en [directus-errors-logger.md](directus-errors-logger.md).

### Versiones reales

Las versiones instaladas verificadas son:

- Next.js **16.4.2**.
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
- **Integridad:** `client`, `description`, `folio`, `technician_name`, `client_name`, ambas firmas y el alias `scales` aparecen como `required` en metadatos de interfaz, pero las columnas físicas respectivas admiten `NULL`; el alias no es una columna física. Por decisión de producto, todos estos campos requeridos —incluidas ambas firmas— deben estar presentes en cualquier guardado, cualquiera que sea el estado, y debe haber al menos una báscula; cero líneas de refacciones es válido. Esto aún no demuestra enforcement equivalente en la API. El usuario declara que todavía no hay órdenes, sin consulta de registros. `folio` UUID tampoco equivale a un consecutivo legible.

La revisión de metadatos confirmó además `clients` (cliente con datos fiscales y de contacto), `inventory` (stock entero y `type` que incluye `spare_parts` y `equipments`), `inventory_movements` (relaciones a inventario, cliente y proveedor; `quantity` float) y catálogos `brands`, `models` y `suppliers`. **No** hay relación `scales.client` ni vínculo `inventory_movements.order`. `inventory.price` existe y fue verificado por metadatos como decimal(10,2), nullable y default `NULL`; no se exige en la UI. El usuario creó `order.status`: el MCP verificó campo string, opciones `draft`, `paid`, `cancelled`, UI `required`, columna `NOT NULL`, índice y default `draft`. El dropdown no impone por sí solo transiciones ni bloqueo de edición. La colección de líneas de orden sigue sin crearse. La cantidad de movimientos es float, mientras el stock es entero; se requiere definir y validar cantidades enteras positivas y stock no negativo antes de automatizar descuentos.

En Next.js, `types/schema.ts:94-187` no incluye las colecciones metrológicas ni se encontraron tipos, consultas, repositorios o rutas de órdenes; tampoco un snapshot local de Directus. El trabajo es **incorporar soporte privado a Next.js y proponer únicamente cambios de esquema justificados**, sin duplicar `order` ni usar `consecutives`. Los tipos y consultas públicos de `clients` no incluyen datos sensibles ni sirven como contrato privado completo.

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

No se encontró un `components/ui/sidebar.tsx`.

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

**No está instalado todo el catálogo de pdfcn.** La revisión actual encontró `components/pdf/pdf-image.tsx:40-61,122-184` y el nuevo archivo local `components/pdf/data-table.tsx:21-135` (todavía sin seguimiento en Git). `DataTable` compone `Table`; `PdfImage` acepta URI y opcionalmente headers, pero eso **no** autoriza automáticamente la lectura de archivos privados. No se encontró un componente independiente `keep-together`. No se probó el renderizado de estas piezas. `types/pdf-themes/data-table.types.ts:3` importa una ruta inexistente (`@/components/pdf/table/table.types`); corregirla y verificar tipado antes de considerar `DataTable` utilizable.

La imagen aportada muestra fecha, datos del cliente, servicio, equipos, refacciones con precios/totales, firmas, logos y pie comercial. Es **referencia visual**, no autorización para inventar esos datos ni convertir su número decimal en el folio UUID. Los ocho logos WebP están en `assets/logos/pdf`; la imagen original está fuera del repositorio y debe volver a proporcionarse en otro equipo si se requiere comparar píxel a píxel.

Límites importantes:

- La tabla local usa `View`, no la tabla semántica nativa de Forme. No hay prueba de repetición automática de encabezados.
- Cada fila usa `wrap={false}` (`components/pdf/table.tsx:169-173`): una fila mayor que una página necesita tratamiento explícito; el nuevo `DataTable` no cambia esa limitación.
- `formatValue(null)` produce cadena vacía (`lib/pdf-themes/styles/data-table.styles.ts:45-55`): detectar datos requeridos nulos o denegados **antes** de generar un documento aparentemente completo.
- `PageNumber` declara `fixed`, pero su implementación no lo utiliza (`components/pdf/page-number.tsx:15-32,56-93`); para repetirlo hay que componerlo dentro de un pie fijo.
- El proveedor de tema mantiene una variable global mutable: `components/pdf/theme-provider.tsx:9,36-58`. No introducir temas por usuario; el MVP usaría un único tema y probaría renderizados concurrentes.

No se encontró un flujo existente de generación y descarga de informes metrológicos.

### Estado actual de verificación

Los marcadores de conflicto que citaba la investigación anterior **ya no están** en `vitest.config.ts:19-58` ni en `app/api/redirects/route.ts:1-13`. Ambos archivos tienen cambios locales: su resolución no demuestra que las pruebas pasen. No se ejecutaron pruebas, typecheck, navegador ni build.

`pnpm pre-deploy` ejecuta **format con escritura y build** (`package.json:15`). No es compatible con esta investigación/actualización documental de alcance limitado.

## 3. Propuesta técnica mínima

### 3.1 Autenticación: comparar JSON con `session`, sin decisión aprobada

**La recomendación anterior de JSON se retira como decisión.** Que los tokens lleguen en JSON a Next.js no implica entregarlos al JavaScript del navegador, pero obliga a custodiar y rotar access y refresh tokens correctamente. Elegir el modo tras probar el despliegue y las carreras reales, no a partir de la etiqueta «SSR» del tutorial.

Comparación necesaria:

- **JSON:** devuelve access token, refresh token y duración. Next.js controla sus cookies del mismo origen y usa el access token en las consultas del empleado.
- **`session`:** Directus emite una cookie con un token que combina acceso y renovación. Es viable, pero requiere resolver dominio, reenvío de cookies y propagación de `Set-Cookie` entre Directus, Next.js y navegador.
- **`cookie` no es sinónimo de `session`:** es otro modo, asociado al refresh token en cookie.

**Propuesta:** evaluar primero si `session` puede operar detrás de Next.js con dominios y cookies reales, reenvío Next.js → Directus, propagación de `Set-Cookie`, expiración y revocación. No asumir que la cookie de Directus será legible en el origen Next.js. JSON evita parte de esa topología, pero exige una solución demostrable contra respuestas de refresh fuera de orden en varias pestañas e instancias. Si ninguna variante demuestra renovación segura, el MVP debe fallar cerrado y pedir nuevo login al vencer la sesión, no prometer renovación transparente.

Fuentes:

- [Tokens y cookies de Directus](https://directus.com/docs/guides/auth/tokens-cookies).
- [SDK oficial de Directus](https://directus.com/docs/guides/connect/sdk).
- [Autenticación Next.js: sección JSON solicitada](https://directus.com/docs/frameworks/nextjs/authentication#json-authentication-mode).

**No copiar literalmente el tutorial:** utiliza un cliente global mutable, registra respuestas de login y muestra un logout que solo borra una cookie. No constituye por sí solo una solución completa para producción.

### 3.2 Ciclo de sesión

1. **Login**
   - Formulario accesible, validación en servidor y mensajes genéricos para no revelar cuentas.
   - SDK `login(..., { mode: "json" | "session" })` **según el modo validado**, no ambos a la vez.
   - Cliente sin estado de autenticación compartido.
   - Respetar MFA si las cuentas lo requieren; no inventar un mecanismo alternativo.
   - Validar ingreso al área antes de establecer la sesión definitiva.

2. **Cookies**
   - En JSON, access y refresh tokens en cookies `HttpOnly` administradas por Next.js; en `session`, verificar el dominio y la propagación efectiva de la cookie emitida por Directus.
   - `Secure` en producción, sin `Domain` compartido y con `SameSite` explícito.
   - Duraciones alineadas con la configuración real de Directus; no asumir sus valores por defecto.
   - Sin tokens en `localStorage`, props, URLs o parámetros de descarga.
   - No guardar contraseñas ni copiar roles del navegador como autoridad.

3. **Validación**
   - Una función pequeña de acceso a datos verifica identidad con `readMe()` y devuelve solo los campos necesarios.
   - Cada consulta privada usa las credenciales de esa solicitud: por ejemplo `withToken()` en JSON, o la cookie de sesión del empleado reenviada correctamente en `session`; nunca el token público compartido.
   - La existencia de una cookie, o decodificar un JWT sin validación, no basta.
   - El acceso a una orden se resuelve mediante una lectura autorizada de esa orden.

4. **Expiración y refresh**
   - Renovación en una Server Action o Route Handler mediante POST.
   - No renovar y escribir cookies durante el render de un Server Component.
   - No usar temporizadores automáticos del SDK como gestor de sesiones del servidor.
   - Access token vencido: renovar solo si la estrategia elegida resiste concurrencia; en caso contrario, requerir nuevo login.
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
- Un flujo explícito concentra el refresh; deduplicar una interfaz es una optimización, **no** coordinación suficiente entre pestañas o réplicas.
- Nunca hay un token de empleado almacenado en un singleton mutable.
- Hay que probar múltiples pestañas, respuestas fuera de orden y logout durante refresh.

Directus documenta `SESSION_REFRESH_GRACE_PERIOD` para tolerar carreras de renovación. **No se comprobó la versión del servidor, su configuración ni su comportamiento real.** La documentación no basta para garantizar todos los casos de varias pestañas y réplicas.

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

Fuente: [Control de acceso de Directus](https://directus.com/docs/guides/auth/access-control).

Se necesita todavía la relación opcional `scales.client → clients` para filtrar y validar básculas. `inventory.price` sí existe (decimal(10,2), nullable, default `NULL`). `order.status` ya fue creado por el usuario con valores `draft`, `paid`, `cancelled`, default `draft` y columna no nullable; `cancelled → draft` está permitido, mientras `cancelled → paid` directo sigue sin decidirse. El usuario afirma que no hay órdenes previas: no planear una migración retrospectiva sin motivo. La colección de líneas y el vínculo de movimientos a orden siguen sin crearse. No añadir campos, relaciones ni Flows ni alterar datos sin autorización expresa.

### 3.5 Caché, CSRF y secretos

- Mantener Cache Components habilitado.
- Leer cookies y parámetros dinámicos dentro de componentes bajo `Suspense`, no en el shell raíz.
- No usar `"use cache"` compartido para identidad, órdenes, relaciones privadas o PDF.
- No introducir tokens como argumentos o tags de funciones cacheadas.
- Usar `cache: "no-store"` en las solicitudes privadas y respuestas de descarga no almacenables.
- No incorporar caché privada del navegador como optimización inicial.
- Invalidar estado privado al cerrar sesión o cambiar de usuario; el `QueryProvider` actual mantiene caché en el navegador (`providers/QueryProvider.tsx:6-15`).
- POST para login, refresh y logout; comprobar origen en Route Handlers. Las Server Actions ya incorporan comparación `Origin`/`Host`, pero siguen necesitando autenticación y autorización.
- Validar destinos de retorno para evitar redirecciones abiertas.
- Limitar intentos de login y generación costosa reutilizando los mecanismos instalados, sin usar esos mecanismos como sustituto de permisos.
- Mantener cuerpos de autenticación, cookies y errores SDK completos fuera de los registros; el plan de redacción y clasificación vive en [directus-errors-logger.md](directus-errors-logger.md).

El proxy actual excluye `/api` y determinadas solicitudes de prefetch (`proxy.ts:68-82`). **No puede ser el único control de autorización.**

Guías instaladas contrastadas:

- `node_modules/next/dist/docs/01-app/02-guides/authentication.md:1131-1181,1356-1374`.
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md:40-69,295-314`.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md:6-7,67-91`.

Enlaces oficiales:

- [Autenticación en Next.js](https://nextjs.org/docs/app/guides/authentication).
- [Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies).
- [Seguridad de datos](https://nextjs.org/docs/app/guides/data-security).

### 3.6 Área interna y sidebar

Rutas propuestas, no existentes:

- `/metrologia/login`
- `/metrologia/ordenes`
- `/metrologia/ordenes/[id]`
- `/api/metrologia/ordenes/[id]/pdf`

Separar login del layout protegido para evitar ciclos de redirección.

La navegación debe seguir tareas reales: **Órdenes** como flujo principal; **Clientes**, **Básculas**, **Inventario** y **Movimientos** cuando tengan pantallas útiles y permisos efectivos. Perfil propio y logout; `brands`, `models`, `suppliers`, archivos y uniones (`order_scales`) pueden ser selectores/relaciones, no necesariamente módulos de menú. No mostrar enlaces vacíos ni convertir cada colección en una ruta por automatismo. Ocultar un enlace no sustituye verificar autorización en el servidor.

Se recomienda la composición sencilla de [Sidebar](https://ui.shadcn.com/docs/components/sidebar), inspirada en los [bloques solicitados](https://ui.shadcn.com/blocks/sidebar):

- Panel lateral en escritorio y drawer en móvil.
- Reutilizar `Sheet`, `Button`, enlaces, separadores y componentes de feedback.
- Una misma definición de enlaces para escritorio y móvil.
- Título accesible del drawer, foco inicial y de retorno, Escape, navegación con teclado, `aria-current` y enlace para saltar al contenido.
- Tema oscuro y estado activo neutral.
- Sin selector de organizaciones, buscador global o persistencia de preferencias no pedidos.

### 3.7 PDF actual, descargable y no persistido

Flujo:

1. Validar sesión e ID.
2. Leer `order` y las relaciones necesarias con el token del empleado.
3. Validar que los datos requeridos por la plantilla estén disponibles y autorizados, incluso si figuran como `required` pero permiten `NULL` en la base.
4. Construir el documento con componentes locales.
5. Generar bytes con `renderDocument()` de `@formepdf/core`.
6. Responder con `application/pdf`, `Content-Disposition: attachment`, nombre seguro y `Cache-Control: private, no-store`.
7. No crear registros ni subir archivos a Directus.

`renderDocument()` devuelve `Uint8Array`: `node_modules/@formepdf/core/dist/index.d.ts:255`. El motor usa WASM en su entrada Node (`node_modules/@formepdf/core/dist/index.js:1-4`); el empaquetado y consumo de memoria deben probarse posteriormente.

**Firmas:** `PdfSignatureBlock` es un bloque visual, no una prueba de aprobación. El motor instalado sí expone `certifyPdf()` (`node_modules/@formepdf/core/dist/index.d.ts:279`), pero no hay evidencia de certificados o un proceso autorizado. No incorporarlo al MVP sin un requisito explícito.

**Imágenes privadas:** no usar directamente las URL públicas de `getAssetUrl()` para firmas. El motor descarga imágenes HTTP mediante un `fetch` propio sin credenciales de empleado (`node_modules/@formepdf/core/dist/index.js:37-47`). Deben recuperarse del origen permitido con autorización individual, validar tamaño/tipo y entregarse al renderer como datos en memoria. No aceptar URLs arbitrarias.

**Varias básculas:** el esquema **sí confirma** `order.scales` M2M a través de `order_scales.sort`. Renderizar todas las autorizadas en orden estable, sin truncarlas silenciosamente por límites de consulta; verificar los permisos tanto en la unión como en `scales` y sus relaciones/archivos.

**Paginación:** probar contenido largo, encabezados, pies, filas grandes y bloques de firma. No aplicar `noWrap` a toda la tabla.

**Integridad y presentación del PDF:** los campos requeridos pueden ser `NULL` en la base; para guardar, deben estar presentes todos los requeridos, incluidas ambas firmas, y al menos una báscula, con independencia del estado. `order.date_created` es la fecha impresa; `description` es el texto general de servicio para todas las básculas; nombre del receptor y departamento son captura manual en los campos existentes. El PDF puede ocultar valores requeridos sin alterar el documento guardado. Las opciones para ocultar son transitorias por descarga/preview, no permisos ni cambios de datos: cualquier valor dinámico individual (incluidos totales de renglón, subtotal, IVA y total final) se puede ocultar, dejando celda/etiqueta/sección en blanco sin sustituirlo. Si falta precio en inventario, imprimirlo en blanco, nunca como cero; si una línea no tiene precio, dejar también en blanco su importe y todos los totales monetarios derivados, incluido IVA, no mostrar sumas parciales engañosas. Un fallo de consulta o denegación no debe interpretarse como opción de ocultamiento. La clasificación de fallos y sus mensajes se definen en [directus-errors-logger.md](directus-errors-logger.md).

No se identificó una limitación que justifique Gotenberg.

Referencias:

- [Índice pdfcn](https://www.pdfcn.dev/llms.txt).
- [Instalación y distinción Forme/Takumi](https://www.pdfcn.dev/docs/installation.md).

### 3.8 CRUD privado escalable sin CRUD genérico

Mantener **separados** el cliente público `staticToken()`/`"use cache"` y los consumidores privados por solicitud. `getClientsQuery()` hoy convierte errores en `[]` y el count en `0`; un recurso privado no puede reutilizar ese resultado como si la consulta hubiera tenido éxito. El registro de `/debug` es para lectores del inspector público, no para autorizar ni despachar mutaciones privadas. Las excepciones a `.cursor/rules/directus-sdk-client.mdc` y `directus-omit-sensitive-fields.mdc` deben ser **acotadas al módulo privado**, no exponer PII, stock o precios en el Schema/inspector públicos.

- Base compartida mínima: sesión individual, cliente SDK por solicitud, paginación/entrada validada y contrato de fallos seguros. Nunca confiar en el menú para autorizar.
- Por colección, definir campos explícitos y relaciones, consultas de listado/detalle y repositorios u operaciones necesarias; cada mutación valida servidor, límites de campos y estado. `order` mantiene su lógica propia; **no** crear un formulario universal a partir del esquema.
- Compartir UI de tabla, filtro y formulario sin copiar controles de negocio. Una colección nueva se agrega cuando haya una tarea real, con pruebas de acceso de dos usuarios; uniones (`order_scales`, `scales_files`) no requieren pantalla por sí mismas.
- `clients` incluye RFC/contacto: aislar sus consultas privadas de las públicas. `scales` permite gestionar básculas del cliente; `inventory` y `inventory_movements` atienden existencias y cambios. `brands`, `models`, `suppliers` y archivos son dependencias/selecciones, con CRUD propio solo si una tarea lo justifica. Perfil propio no implica administrar usuarios ajenos.

### 3.9 Orden, editor y preview

- Proponer `scales.client` como relación nullable con `clients` para no atribuir registros anteriores por inferencia. Elegir cliente filtra las básculas visibles a las asociadas; sin cliente, no aparecen. Revalidar al guardar que **todas** las básculas elegidas aún pertenecen al cliente: un cambio concurrente o pérdida de permisos rechaza la operación sin guardar parcialmente.
- Si se cambia el cliente en el formulario, las básculas elegidas se conservan en el **borrador** y se señalan incompatibles; el usuario debe reemplazarlas/quitarlas o restaurar el cliente. El formulario bloquea guardar y el preview no presenta un PDF aparentemente válido hasta resolverlo. No borrar relaciones silenciosamente.
- Formulario izquierda y PDF de borrador derecha en escritorio; en móvil, PDF visible y formulario dentro de `components/ui/drawer.tsx` con foco/scroll/cierre accesibles. Preview del borrador **sin guardar** ni disparar Flows, con control de frecuencia/cancelación de resultados obsoletos y sin exponer assets privados. Las elecciones de ocultamiento se mantienen solo en memoria durante preview/descarga y no se guardan en la orden. La entrada browser de Forme 0.25.0 existe, pero su rendimiento/compatibilidad y la alternativa de endpoint protegido no se han probado: seleccionar ruta tras prueba de render.
- Cuatro cargos opcionales capturados manualmente: mano de obra, horas extra, viáticos y otros. Subtotal = suma de precio actual de cada artículo × cantidad + cargos; IVA opcional de 16% sobre todo el subtotal; total final calculado. MXN con dos decimales. Cada valor dinámico puede ocultarse independientemente en cada descarga, incluidos importes de renglón y totales; conservar filas, etiquetas y disposición dejando el valor vacío. No persistir opciones de ocultamiento ni cambiar los datos guardados. Precio `NULL`: mostrar vacío, nunca cero. Si algún artículo no tiene precio, dejar vacíos su importe y todos los totales derivados, IVA incluido, en vez de presentar un parcial.
- Preview y descarga reflejan datos vivos de Directus, también para órdenes `paid`; no son una copia histórica. Volver a consultar datos autorizados actuales en servidor al descargar; un borrador del navegador no es autoridad. Si falta un dato/relación requerido o hay denegación, no emitir PDF incompleto. El historial actual del backend no implica una UI paralela ni un snapshot del PDF.
- La regla de **solo editar en `draft`** aplica a cualquier documento, no a clientes, inventario o movimientos por ser colecciones de apoyo. Cualquier documento puede volver a `draft` desde otro estado con una transición explícita y permiso, pero cambiar el estado no autoriza editar contenido en la misma operación mientras aún no se haya validado el cambio. En Next.js se comprueba el estado al mostrar el editor y en cada mutación; la interfaz no sustituye la validación de estado y permisos en el servidor. Si se necesita impedir también ediciones directas mediante la API de Directus fuera de Next.js, harán falta controles backend efectivos que todavía no se diseñaron.
- `order.status` **ya existe** con valores exactos `draft`, `paid`, `cancelled`, default `draft` y `NOT NULL`. `draft → paid` es la confirmación del pago y dispara la acción de inventario, sin campos de fecha/monto/método de pago adicionales. Una cancelada permanece bloqueada para editar contenido hasta un cambio explícito `cancelled → draft`; el camino habitual es crear otra orden. `paid → draft` conserva las salidas originales; al repagar se concilia solo el delta. `paid → cancelled` compensa el saldo; `cancelled → draft` puede ocurrir sin recuperar automáticamente salidas compensadas, y un pago posterior aplica solo el saldo pendiente. Sigue sin respuesta si se permite `cancelled → paid` directo o se exige pasar por `draft`. El usuario declara que aún no existen órdenes y que el historial de cancelaciones ya se guarda en backend; no construir vista paralela ni asumir campos/retención no verificados. El Flow existente «Movimientos Inventario» solo procesa create/update/delete de `inventory_movements` y sus efectos de stock, no transiciones de órdenes. Un Flow dedicado para órdenes es una **recomendación, no una decisión**. La relación de una línea por artículo/orden aún no existe; cantidad entera positiva, cero líneas permitidas y quantity controla el descuento. En borrador no se reserva ni descuenta stock. `inventory.price` existe como decimal(10,2), nullable, default `NULL`; se usa precio actual, no snapshot aplicado a la orden.
- El usuario permite editar y borrar manualmente movimientos con permisos, incluidos los originados por órdenes; prefiere compensar mediante otro movimiento, pero la conciliación posterior aún requiere diseño. Definir vínculo movimiento→orden, idempotencia/reconciliación, atomicidad transaccional y concurrencia. El Flow actual solo procesa altas/ediciones/borrados de `inventory_movements`; se desconocen sus permisos efectivos (`$trigger`), aplicación de enteros/stock ≥ 0 y comportamiento concurrente. Un Flow dedicado de órdenes es solo recomendación. Al añadir una refacción, advertir y bloquear si el stock es insuficiente; revalidar en servidor y, al pasar a `paid`, volver a comprobar stock y rechazar toda la transición sin retiros parciales si ya no alcanza.

## 4. Plan por etapas

### Etapa 0 — Cerrar el contrato de negocio y los permisos

`order.status` ya existe (`draft`, `paid`, `cancelled`; default `draft`, `NOT NULL`). Resolver primero si `cancelled → paid` directo está permitido o requiere `draft`; definir controles/efectos restantes, manejo de movimientos manuales, vínculo movimiento→orden, atomicidad, idempotencia y concurrencia. La entidad de líneas de refacciones aún no existe; definirla como una línea por producto y orden, cantidad entera positiva, cero líneas permitidas, stock no negativo y precio vivo nullable de `inventory` (decimal(10,2), MXN). Diseñar validación de stock al agregar y revalidación atómica al pagar, sin reserva/deducción en `draft`. Los cuatro cargos opcionales son mano de obra, horas extra, viáticos y otros; subtotal = líneas al precio actual × cantidad más cargos, IVA opcional 16% sobre el subtotal, total calculado. El usuario administrará roles/políticas; comprobar permisos efectivos, condiciones de despliegue, MFA y versión/configuración Directus **solo con autorización para consultar ese alcance**. La evidencia de metadatos no prueba permisos ni enforcement de API. El Flow dedicado para transición de orden es una recomendación, no decisión.

**Salida:** contratos y migración revisables; sin asumir operaciones, estados, stock o permisos que no se verificaron.

### Etapa 1 — Sesión individual y shell privado

Implementar cliente de sesión por solicitud, login/refresh/logout según modo probado, cookies `HttpOnly`, separación layout público/privado y navegación accesible con componentes locales. Probar dos pestañas, respuestas de refresh fuera de orden, logout concurrente y varias instancias; si no se demuestra seguridad, pedir nuevo login al expirar. Preservar rutas públicas y mantenimiento; nunca incluir datos privados en caché/inspector públicos.

### Etapa 2 — Lecturas y administración de recursos necesarios

Incorporar tipos/consultas/repositorios **privados** con campos explícitos y paginación para órdenes, clientes, básculas, inventario y movimientos; adicionar formularios/operaciones por flujo real. `brands`, `models`, `suppliers` y firmas según dependencias verificadas. Navegación solo para módulos útiles y autorizados; operaciones y URL directa vuelven a autorizar. Separar «sin registros» de denegación y caída del servicio. No agregar `consecutives`.

### Etapa 3 — Modelo y ciclo de la orden

**Solo tras autorizar otros cambios de esquema/Flow:** incorporar `scales.client` opcional, la colección propuesta de líneas de refacciones y el vínculo de movimientos con orden. `order.status` ya existe, pero sus transiciones y efectos requieren diseño y protección; un Flow dedicado a órdenes es recomendación. Aplicar precio vivo de inventario (no snapshot), cantidades enteras, ninguna reserva en draft y revalidación de stock al pagar con rechazo completo ante stock insuficiente. Proteger y probar transiciones, cambios de cliente/básculas y acciones manuales sobre movimientos vinculados. No migrar dueños de básculas por inferencia; no borrar físicamente órdenes pagadas.

### Etapa 4 — Editor y PDF

Editor responsivo con validación y preview de borrador; elegir render browser o endpoint protegido después de medirlo. Construir plantilla basada en la imagen proporcionada y logos locales; comprobar páginas, tablas, firmas y caracteres españoles. Descarga final autorizada con lectura nueva y PDF en memoria; no persistir documento en Directus. Probar contenido largo, ausencia de datos, denegaciones y cambios de permiso entre detalle y descarga.

### Etapa 5 — Evaluación posterior

Investigar `traceable` y `accredited` por separado; hoy el esquema inspeccionado solo prueba campos de auditoría. Identificar las fuentes reales antes de diseñar cálculos, informes, historia o aprobaciones. `consecutives` queda fuera, sin consultas, pantallas ni modificación de numeración.

## 5. Pruebas de aceptación imprescindibles

Con dos cuentas de prueba, **A y B**, cuyos permisos reales sean diferentes; estos son identificadores de prueba, no roles propuestos:

- A puede leer una orden O1; B no.
- A abre el detalle y descarga su PDF.
- B solicita **directamente** la URL de O1 y su endpoint PDF: no recibe datos ni bytes del documento.
- B conserva acceso a las órdenes que sí tenga permitidas.
- Ambos tienen diferencias comprobables de campos o relaciones: el PDF no recupera lo oculto mediante el token público.
- Visitante anónimo: redirección al login en páginas y respuesta no autorizada en el endpoint.
- O1 inexistente o no visible: respuesta que no revele su existencia.
- Al elegir cliente A, mostrar solo sus básculas; sin cliente asignado no aparecen. Cliente B con báscula de A: incompatibilidad visible, sin borrado silencioso; no guardar ni presentar PDF como válido. Cambiar la relación mientras se edita: rechazo completo por validación del servidor.
- Crear/editar/eliminar en cada módulo usando permisos efectivos de A y B; prohibición de A no puede eludirse mediante llamada directa, campo oculto, URL, búsqueda, archivo o relación. No convertir rechazo/caída en lista vacía.
- En cualquier documento, solo `draft` admite edición de contenido; intentar editar en otro estado no persiste datos, incluso mediante llamada directa a Next.js. En órdenes, guardar siempre exige todos los campos obligatorios y firmas, cualquier estado, y al menos una báscula; cero refacciones permitido. Paid/cancelled requiere primero cambio explícito y autorizado a `draft` para editar. El paso `draft → paid` confirma el pago y descuenta existencias; no hay campos separados de fecha, monto o método de pago. Repago idéntico: cero movimientos nuevos; cambios: solo delta; cancelación: compensación neta, sin borrar historial. `cancelled → draft` no recupera automáticamente salidas compensadas; luego el pago aplica solo saldo pendiente. Sigue sin respuesta si `cancelled → paid` directo está permitido. Reintentos y dos pagos simultáneos no duplican descuentos; falta verificar atomicidad y concurrencia. Movimientos manuales de órdenes se pueden editar/borrar con permisos; el usuario prefiere compensarlos con otro movimiento, falta definir conciliación. Validar stock al agregar y revalidar al pagar; si es insuficiente, rechazar sin retiro parcial. Los metadatos no prueban que API haga cumplir requisitos ni transiciones.
- Revocar permisos entre abrir el detalle y descargar: la descarga vuelve a autorizar.
- Ejecutar solicitudes A/B intercaladas: sin contaminación por cliente, caché o estado.
- Expirar acceso, renovar, usar refresh inválido y simular Directus caído.
- Dos pestañas renovando; refresh simultáneo con logout; respuestas fuera de orden.
- Cambio de usuario en el mismo navegador y navegación atrás: sin datos privados residuales.
- POST desde otro origen y manipulación del destino de retorno: rechazados.
- PDF con texto largo, caracteres españoles, varias básculas relacionadas mediante `order_scales`, muchas filas y firmas nulas, ausentes o restringidas.
- Verificar que generar y descargar no crea archivos, relaciones, registros ni cambios de numeración en Directus.
- Regresión del sitio público y accesibilidad por teclado/móvil.

Primero se pueden usar mocks deterministas; **no sustituyen** las pruebas posteriores contra permisos reales en un entorno autorizado.

## 6. Históricos, pendientes y decisión necesaria

**Consultar datos históricos no equivale a reproducir exactamente un PDF anterior.**

Un PDF regenerado con datos actuales cambia si cambia la orden o la plantilla. Para reproducción exacta harían falta revisiones inmutables de datos, plantilla y recursos —o conservar el documento—. No se propone incorporarlo: excede el alcance actual y debe decidirse si aparece como requisito.

### Verificaciones no realizadas

- Snapshot/export local (no localizado). **El esquema vivo básico de `order`, `scales`, `traceable` y `accredited` sí se verificó por MCP**, pero no sus registros, datos históricos ni consistencia efectiva.
- Roles, políticas, MFA, TTL, versión y configuración efectiva de Directus.
- Identidad y privilegios del token público.
- Renovación concurrente contra la versión real del servidor.
- Renderizado, paginación, memoria y empaquetado WASM en Next.js.
- Pruebas, typecheck, lint, build y comprobación en navegador.

En la investigación inicial funcionó CodeGraph; la revisión posterior lo contrastó con Git y lecturas locales (757 archivos indexados, con advertencia de algún vínculo pendiente de sincronización). Directus Documentation MCP aportó documentación pública; **Directus MCP**, autorizado posteriormente por el usuario para investigar el esquema, aportó metadatos vivos mediante `schema`, `fields`, `relations` y `collections`, siempre en modo lectura. Ninguno de esos metadatos prueba los permisos de las cuentas de empleados.

### Decisiones abiertas, por prioridad

1. **Próxima pregunta (exacta):** ¿se permite la transición directa `cancelled → paid`, o debe pasar primero por `draft`? No asumir la respuesta.
2. ¿Cómo repercuten los cambios/eliminaciones manuales de movimientos de órdenes en la conciliación? El usuario los permite con permisos y prefiere compensar con otro movimiento; falta concretar la regla.
3. Diseñar vínculo de movimiento a orden, idempotencia/reconciliación, atomicidad transaccional y concurrencia; verificar los permisos `$trigger`, validación de cantidades enteras y stock ≥ 0 del Flow actual. Verificar que el pago rechaza sin cambios parciales cuando no hay stock suficiente.
4. La estructura propuesta de renglones de refacciones todavía no existe; resolver campos restantes, descuentos/redondeo monetario y reglas de precios si el precio vivo cambia. Ya están acordados precio actual nullable, cuatro cargos opcionales, subtotal, IVA opcional 16%, total calculado, cero líneas permitidas y cantidades enteras positivas.
5. Comprobar políticas de Directus solo con autorización específica. Confirmar manualmente si básculas actuales necesitan relación a cliente; no leer ni modificar registros ni inferir dueños. Elegir browser/endpoint para preview tras prueba. Histórico inmutable del PDF no está acordado.
6. Elegir modo de sesión `json` frente a `session` tras pruebas reales de dominio y refresh; hasta entonces no prometer renovación transparente.

Estas preguntas no autorizan implementación ni lectura de registros/usuarios/políticas; la autorización de MCP cubrió solo metadatos del esquema y lectura del Flow existente. Esta actualización documental no crea campos, Flows, archivos ni registros.

### Restricciones que se mantienen

- Autenticación y sesiones únicamente con Next.js y el SDK oficial de Directus; sin Better Auth, Auth.js, iron-session u otras bibliotecas externas de autenticación.
- Reutilizar dependencias de PDF y componentes pdfcn instalados, sin asumir disponibilidad de todo el catálogo.
- Reutilizar componentes y patrones existentes; sin funcionalidades ni abstracciones especulativas.
- No sacrificar seguridad, autorización, manejo de errores ni accesibilidad.
- Sin registro público de usuarios.
- Sin Gotenberg mientras no exista una limitación concreta que lo justifique.
- Sin build en esta tarea.
- La autorización ya concedida cubrió exclusivamente lectura de metadatos del esquema mediante MCP. Para acceder a datos, usuarios, políticas, credenciales o sesiones se requiere autorización explícita para ese alcance; nunca leer ni mostrar secretos.

**Riesgo principal:** permisos y sesión, integridad cliente-básculas, stock e idempotencia/concurrencia de movimientos. Deben comprobarse con usuarios distintos y datos aislados antes de habilitar operaciones privadas.

## 7. Prompt para retomar en otro equipo

Copiar este bloque en una sesión nueva **con acceso al repositorio**. El plan viaja con el proyecto; la imagen original `C:\Users\benog\Downloads\order.jpg` puede no estar en el otro equipo, así que pedirla nuevamente si es necesaria para revisar la fidelidad visual.

```text
Quiero continuar la planificación del área privada de metrología. Leé primero AGENTS.md, las reglas .cursor/rules aplicables y docs/plans/area-privada-metrologia.md completo; el plan separado de errores/logger es docs/plans/directus-errors-logger.md y se implementará por separado. Revisá el estado actual del repositorio y no sobrescribas cambios ajenos.

Esta es una conversación de diseño: no implementes código, no crees/modifiques campos o Flows de Directus, no consultes registros, usuarios, políticas, archivos privados ni secretos sin mi autorización específica. Podés proponer consultas de metadatos de esquema si hacen falta y preguntarme primero cuando el alcance de acceso no esté claro. No supongas que permisos de Directus se infieren del esquema.

Decisiones confirmadas: el contenido de cualquier documento solo se edita en `draft`; desde cualquier otro estado se puede volver explícitamente a `draft` con permiso. Esto no implica que traceable/accredited tengan campo status. Next.js + SDK oficial de Directus, sesiones individuales y permisos efectivos; el usuario administra políticas. CRUD de órdenes y colecciones útiles (clientes, básculas, inventario, movimientos, etc.). scales son básculas de clientes, no inventory.type=equipments. Hace falta scales.client -> clients, nullable/propuesta y aún no creada; básculas sin cliente no aparecen. Si cambia el cliente de una orden, conservar selecciones incompatibles señaladas y bloquear guardado/PDF válido hasta resolverlas; revalidar en servidor. No inferir dueños anteriores.

El usuario confirma que no hay órdenes (sin consultar registros). order.status ya existe: `draft`, `paid`, `cancelled`, default `draft`, NOT NULL. `draft → cancelled` y `cancelled → draft` están permitidos, aunque tras cancelar el camino normal es crear otra orden. La próxima pregunta exacta es: ¿se permite `cancelled → paid` directo o debe pasar primero por `draft`? No asumir. `draft → paid` confirma el pago y dispara descuento; no se requieren fecha/monto/método de pago adicionales. `paid → draft` conserva retiros; al repagar concilia solo delta. `paid → cancelled` compensa saldo; `cancelled → draft` no recupera automáticamente retiros compensados. El historial de cancelaciones existe en backend según el usuario; no crear vista/historial paralelo ni asumir sus campos/retención. No modificar backend/Directus, campos, datos, Flows o políticas sin autorización específica.

Orden: folio UUID. Todo guardado, cualquier estado, requiere todos los campos marcados como obligatorios, ambas firmas presentes y al menos una báscula; puede tener cero refacciones. Las etiquetas de UI/metadata no prueban enforcement de API. description es un único texto general de servicio para todas las básculas; order.date_created es la fecha impresa; nombre del receptor y departamento se capturan manualmente en campos existentes. Una línea por artículo de inventario y orden es modelo propuesto aún no creado; quantity es entero positivo, cantidad controla retiros; draft no reserva ni descuenta. Al agregar, advertir y bloquear si el stock es insuficiente; revalidar en servidor, y al pagar rechazar sin retiro parcial si stock insuficiente. inventory.price sí existe (Directus metadata: decimal(10,2), nullable, default NULL); UI no lo requiere. Precio actual de inventory, no snapshot aplicado a la orden; MXN dos decimales. Cuatro cargos manuales opcionales: labor, overtime, travel, other; subtotal = precios actuales × cantidades + cargos; IVA opcional 16% sobre subtotal; total calculado.

PDF: actual/live data incluso para paid; la descarga y preview reflejan cambios actuales de cliente/escalas/inventario, no un histórico congelado. Backend Directus conserva historial; no crear UI de historial duplicada. Opciones transitorias por descarga y preview, no persistidas en orden: cualquier valor dinámico individual (incluyendo importe de fila, subtotal, IVA y total) se puede ocultar independientemente; dejar celda/etiqueta/sección vacía, sin sustituir valor. PDF puede ocultar incluso valor requerido guardado, sin modificarlo. Precio NULL se imprime en blanco, no cero; si falta precio en cualquier línea, importe de esa línea y todos los totales derivados (incluido IVA) quedan en blanco; nunca suma parcial engañosa. Ocultar no es permiso ni encubre dato ausente/fallo de consulta. PDF en memoria, no guardado en Directus, descarga con autorización nueva; dos columnas en escritorio y formulario en components/ui/drawer.tsx móvil. La imagen C:\Users\benog\Downloads\order.jpg puede no transferirse; logos en assets/logos/pdf.

Esquema MCP (metadatos únicamente): order, order_scales, scales, clients, inventory e inventory_movements. Faltan scales.client y vínculo inventory_movements.order. Flow activo «Movimientos Inventario» solo maneja create/update/delete de inventory_movements y efectos de stock, no transiciones de order. CRUD manual de movimientos permitido con permisos; el usuario prefiere compensar con otro movimiento. Aún abiertos: conciliación tras ediciones/borrados manuales, relación orden-movimiento, idempotencia/reconciliación, atomicidad, permisos $trigger, enteros y stock >= 0, concurrencia. Flow dedicado de orden es recomendación solamente. No se verificaron permisos reales, API enforcement, versión/configuración, refresh concurrente ni render PDF. No consultar datos, usuarios, políticas, archivos privados o secretos sin permiso específico. Mantener cliente público staticToken/caché separado de privados, no usar respuesta [] en errores. traceable/accredited quedan para después; consecutives excluida. Plan de logger/errores separado: docs/plans/directus-errors-logger.md.

Hacé una sola pregunta por vez; empieza únicamente con la pregunta exacta sobre `cancelled → paid` indicada arriba. Después cubrí gradualmente los otros puntos abiertos. Distingue decisiones de recomendaciones. La autorización de esta conversación no autoriza modificar backend/Directus ni implementar código. Actualiza el plan solo si el usuario vuelve a pedir/autorizar edición documental.
```
