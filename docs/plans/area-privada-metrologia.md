# Plan para el área privada de metrología

Estado: planificación y decisiones de producto; esta actualización **solo edita este documento** y no autoriza código, nuevas operaciones de Directus ni lectura de registros privados. Una validación de cantidad ya aplicada con autorización al Flow activo se describe en §2; sus pruebas end-to-end y propiedades de atomicidad siguen sin verificarse. El manejo de errores y el logger se planifican por separado en [directus-errors-logger.md](directus-errors-logger.md).
Alcance: área privada para gestionar órdenes de servicio y las colecciones que realmente facilitan ese trabajo, mediante permisos individuales efectivos. `traceable` y `accredited` se evalúan después; `consecutives` permanece excluida.

**Lectura rápida:** el esquema vivo confirma `order`, `order_scales`, `scales`, `clients`, `inventory` e `inventory_movements`; `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). El usuario informó que aún no había órdenes al momento de la conversación; no se consultaron registros. El modelo de líneas de refacciones, `scales.client` y el vínculo de movimientos a órdenes siguen sin crearse. `inventory.price` es decimal(10,2), nullable, default `NULL`. Las decisiones de producto y UI confirmadas están abajo; la ubicación desde la que se editarán movimientos ya vinculados a órdenes sigue abierta. La forma técnica de garantizar transiciones, atomicidad, idempotencia y concurrencia no está demostrada. No se verificaron permisos efectivos, rollback integral, historial de firmas ni renderizado final.

### Decisiones confirmadas (fuente: conversación con el usuario)

- **Regla transversal a documentos:** su contenido solo se puede editar cuando el documento está en `draft`. Desde cualquier otro estado se puede volver a `draft` mediante un cambio explícito si la persona tiene permiso; mientras tanto, la edición de contenido sigue bloqueada. Esto no presupone que `traceable` o `accredited` ya tengan campo de estado: todavía no lo tienen en el esquema consultado, y su diseño queda para más adelante.
- Next.js + SDK oficial de Directus, sesión por persona; Directus gobierna permisos de filas/campos/operaciones. El usuario administra roles y políticas; no codificar el rol «Técnico» ni usar el token público para operaciones privadas. Sin registro público.
- CRUD de órdenes y colecciones útiles para gestionarlas (clientes, básculas, inventario y movimientos, entre otras según tareas concretas), más perfil propio; una colección nueva no implica necesariamente una pantalla propia. Personal no puede borrar físicamente ningún registro del área privada, incluidos movimientos. Solo una persona administradora con permisos efectivos de Directus puede hacer borrados físicos excepcionales. Personal con permiso efectivo de edición sí puede editar movimientos manualmente; la corrección ordinaria es compensatoria. La conciliación y sus bloqueos se especifican en §3.9, pero su implementación técnica aún no está probada.
- `scales` representa básculas de clientes; `inventory.type = equipments` representa existencias y no debe confundirse con esas básculas. Se necesita una relación `scales.client → clients`, **opcional para los registros ya existentes**: una báscula sin cliente no aparece en el selector. No inferir dueño a partir de órdenes históricas.
- En el editor de orden, elegir cliente filtra las básculas disponibles. Si se cambia el cliente con básculas seleccionadas, conservarlas y señalarlas como incompatibles en el borrador; bloquear el guardado (y no presentar un PDF válido de esa combinación) hasta quitarlas/reemplazarlas o restaurar el cliente previo. Revalidar todas las relaciones al guardar, sin cambios parciales.
- Editor en escritorio con formulario a la izquierda y preview del borrador a la derecha; en móvil el formulario se abre en `components/ui/drawer.tsx`. PDF actual en memoria, sin almacenarlo en Directus. Los valores no monetarios disponibles aparecen por defecto; todos los valores monetarios se ocultan por defecto, con controles individuales y «ocultar todos los precios» por descarga, sin persistir visibilidad. El PDF siempre muestra estado discreto; el watermark CANCELADA es opcional. La imagen `C:\Users\benog\Downloads\order.jpg` es referencia visual y puede no estar en otro equipo; hay ocho logos WebP en `assets/logos/pdf`.
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
- Editor de orden y PDF de borrador/descarga final en memoria con Forme y componentes pdfcn locales, sin subir el PDF a Directus; las firmas requieren integración aparte con `directus_files`.
- Navegación interna inspirada en shadcn/ui, adaptada a los componentes React Aria existentes y a las tareas efectivamente disponibles.

**La viabilidad está condicionada a verificar políticas y sesiones reales.** Una consulta posterior, autorizada expresamente por el usuario, confirmó mediante el MCP de Directus la existencia y el esquema de `order`, `traceable` y `accredited`. No se encontró snapshot local ni soporte tipado o consultas de metrología en Next.js; eso es una carencia del frontend, no del servidor.

La investigación original fue local y de solo lectura. En la revisión posterior se consultaron metadatos (`schema`, `fields`, `relations`, `collections`) sin leer registros, usuarios, políticas, archivos ni secretos; posteriormente, con autorización explícita, se actualizó la validación de cantidad del Flow existente y se confirmó la configuración por lectura posterior. El árbol local **ya no está limpio**: contiene cambios ajenos a esta actualización, que no se atribuyen ni se revierten aquí. Esta edición solo actualiza el plan solicitado.

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
- **Integridad:** `client`, `description`, `folio`, `technician_name`, `client_name`, ambas firmas y el alias `scales` aparecen como `required` en metadatos de interfaz, pero las columnas físicas respectivas admiten `NULL`; el alias no es una columna física. Por decisión de producto, todos estos campos —incluidas ambas firmas— deben estar presentes en cualquier guardado, cualquiera que sea el estado, y debe haber al menos una báscula; cero líneas de refacciones es válido. No se puede guardar estado intermedio inválido para reparar identidad/firma. Esto no demuestra enforcement equivalente en API. `folio` es UUID y se imprime completo; no se sustituye por consecutivo.

La revisión de metadatos confirmó además `clients` (cliente con datos fiscales y de contacto), `inventory` (stock entero y `type` que incluye `spare_parts` y `equipments`), `inventory_movements` (relaciones a inventario, cliente y proveedor; `quantity` float) y catálogos `brands`, `models` y `suppliers`. **No** hay relación `scales.client` ni vínculo `inventory_movements.order`. `inventory.price` existe y fue verificado por metadatos como decimal(10,2), nullable y default `NULL`; no se exige en la UI. El usuario creó `order.status`: el MCP verificó campo string, opciones `draft`, `paid`, `cancelled`, UI `required`, columna `NOT NULL`, índice y default `draft`. El dropdown no impone por sí solo transiciones ni bloqueo de edición. La colección de líneas de orden sigue sin crearse. La cantidad de movimientos es float, mientras el stock es entero. Con autorización explícita, el Flow activo «Movimientos Inventario» fue actualizado para validar la cantidad nueva en create/update como entero positivo y rechazar decimal, null, booleano y arrays, preservando valores legados sin cambios en update/delete; la lectura posterior confirmó la configuración remota. El usuario informó una prueba satisfactoria, pero no aportó registros/logs ni stocks, por lo que no hay evidencia independiente de efectos de stock, rollback, atomicidad o concurrencia. Esa actualización es un cambio remoto ya realizado, no una autorización para modificar más Flows ahora.

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

`scales.client → clients` nullable aún se necesita para filtrar/validar básculas; `inventory.price` existe (decimal(10,2), nullable, default `NULL`). `order.status` ya existe (`draft`, `paid`, `cancelled`, default `draft`, NOT NULL); las transiciones están decididas en §3.9, incluida `cancelled → paid` directa. El usuario informó que entonces no había órdenes, pero no se consultaron registros. La colección de líneas y vínculo de movimientos a orden siguen sin crearse. No añadir campos, relaciones ni Flows ni alterar datos sin autorización expresa.

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

### 3.6 Área privada, dashboard y sidebar

Rutas propuestas, no existentes:

- `/metrologia/login`
- `/metrologia` (entrada al área: dashboard, no redirección directa a la tabla)
- `/metrologia/ordenes` y `/metrologia/ordenes/[id]`
- `/metrologia/movimientos` y pantallas de catálogo según §3.8
- `/metrologia/configuracion`
- `/api/metrologia/ordenes/[id]/pdf`

Separar login del layout protegido para evitar ciclos de redirección. La entrada privada es un dashboard con navegación a la izquierda y contenido ocupando el resto. Diseño oscuro fijo conforme a `DESIGN.md`, reutilizando `components/ui/sidebar.tsx`; las capturas externas son referencias de agrupación/ubicación, no especificación literal de colores ni contenido. Al revisar el árbol, `components/ui/sidebar.tsx` figuraba sin seguimiento Git: confirmar que esté versionado antes de depender de él en otro equipo.

**Órdenes:** pestañas `Todas` (predeterminada), `Borradores`, `Pagadas`, `Canceladas`; en cada pestaña ordenar por `order.date_created DESC`. Mostrar folio, fecha de creación, cliente, básculas, técnico, estado, enlace al detalle y, cuando aplique, indicador adicional «Requiere corrección» (referencia rota o discrepancia de stock atribuido), no un cuarto estado. Sin tarjetas métricas, precios en lista ni acciones rápidas de pagar/cancelar/reabrir. Acciones solo en detalle; pagar/cancelar requieren confirmación con efectos esperados sobre stock y revalidación backend.

La lista ofrece vista tabla y lista en escritorio y móvil: tabla inicial en escritorio, lista inicial en móvil; elección recordada localmente por dispositivo. Tabla basada en `@tanstack/react-table` (no era dependencia directa verificada; solo agregarla cuando se autorice implementación), adaptada a `components/ui/table.tsx` y a la guía oficial Data Table/shadcn. Lista basada en `components/ui/item.tsx`. En móvil, la tabla hace scroll horizontal dentro de su panel, no de toda la página. Ambas vistas tienen paginación Anterior/Siguiente y usan una sola búsqueda compartida por folio/cliente con Fuse.js y la configuración de `config/search.ts`, dentro de todas las órdenes que el usuario puede ver en la pestaña seleccionada; se pagina el conjunto coincidente. No hay buscador global ni segundo filtro exclusivo de la tabla. El helper Fuse existente filtra solo los elementos que recibe y el DataTable de cliente no resuelve automáticamente páginas remotas: aún debe diseñarse/validarse cómo buscar el conjunto autorizado completo y paginarlo, no afirmar que ya está resuelto.

**Sidebar:** grupos Operación (Órdenes, Movimientos) y Catálogos (Clientes, Básculas, Inventario, Marcas, Modelos, Proveedores), filtrados por permisos efectivos. En el footer, resumen del usuario con nombre y email; avatar privado autorizado desde Directus, display-only, con `components/ui/avatar.tsx` y fallback de iniciales; nunca token público para el asset. Al hacer clic, `components/ui/dropdown-menu.tsx` muestra únicamente Configuración y Cerrar sesión. No incluir Upgrade, Billing, Notifications ni un enlace Config separado. Configuración tiene sidebar vertical propia con grupos Apariencia y Perfil: Apariencia solo ofrece tamaño de fuente Pequeño/Predeterminado/Grande vía `components/ui/radio-group.tsx` y reducir movimiento on/off; no hay selector de tema. Antes de elección local, movimiento reducido sigue `prefers-reduced-motion`; elección local lo sobreescribe. Ambas preferencias se guardan solo en el dispositivo, no en Directus. Perfil muestra nombre, apellido, email y título; solo nombre, apellido y título editables. Email de solo lectura; contraseña no se muestra ni edita; no mostrar rol ni otros datos sensibles. Avatar de solo lectura.

Las referencias visuales son capturas externas que pueden no estar en otro equipo; representan composición y colocación, no características de producto. Ocultar enlaces no sustituye autorización en servidor. Mantener accesibilidad: drawer con título, foco inicial/de retorno, Escape, teclado, `aria-current` y enlace para saltar al contenido; tema oscuro y activo neutral.

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

**Paginación:** probar contenido largo, encabezados, pies, filas grandes y bloques de firma. No aplicar `noWrap` a toda la tabla. En el detalle de órdenes `paid`/`cancelled`, preview/PDF son de solo lectura si los datos y permisos están íntegros; si la orden queda bloqueada, no mostrar preview obsoleto.

**Integridad y presentación del PDF:** todos los campos requeridos, incluidas ambas firmas, y al menos una báscula se exigen en cada guardado, cualquiera que sea el estado; no se persiste un estado intermedio inválido. `order.date_created` es la fecha impresa; `description` es el texto general de servicio para todas las básculas; receptor y departamento son captura manual. La visibilidad de PDF no altera datos ni permisos: valores no monetarios disponibles se muestran por defecto y todos los valores monetarios se ocultan por defecto. Cada valor dinámico puede mostrarse u ocultarse individualmente, incluso si es obligatorio en la orden guardada; solo la indicación de estado permanece siempre visible. Los controles grupales para mostrar u ocultar todos los importes cubren precios unitarios, importes de filas, cuatro cargos, subtotal, IVA y total; el valor oculto deja su casilla vacía sin sustituirlo ni cambiar la estructura de la plantilla. Nada de esto se persiste. `inventory.price = NULL` no es cero: fila sin precio, importe y todos los totales derivados se imprimen en blanco, sin sumas parciales engañosas; una captura explícita de cargo `0.00` se imprime `$0.00` cuando está visible. Ningún fallo o denegación se representa como ocultamiento. Errores y mensajes se planifican aparte en [directus-errors-logger.md](directus-errors-logger.md).

No se identificó una limitación que justifique Gotenberg.

Referencias:

- [Índice pdfcn](https://www.pdfcn.dev/llms.txt).
- [Instalación y distinción Forme/Takumi](https://www.pdfcn.dev/docs/installation.md).

### 3.8 CRUD privado escalable sin CRUD genérico

Mantener **separados** el cliente público `staticToken()`/`"use cache"` y los consumidores privados por solicitud. `getClientsQuery()` hoy convierte errores en `[]` y el count en `0`; un recurso privado no puede reutilizar ese resultado como si la consulta hubiera tenido éxito. El registro de `/debug` es para lectores del inspector público, no para autorizar ni despachar mutaciones privadas. Las excepciones a `.cursor/rules/directus-sdk-client.mdc` y `directus-omit-sensitive-fields.mdc` deben ser **acotadas al módulo privado**, no exponer PII, stock o precios en el Schema/inspector públicos.

- Base compartida mínima: sesión individual, cliente SDK por solicitud, paginación/entrada validada y contrato de fallos seguros. Nunca confiar en el menú para autorizar.
- Por colección, definir campos explícitos y relaciones, consultas de listado/detalle y repositorios u operaciones necesarias; cada mutación valida servidor, límites de campos y estado. `order` mantiene su lógica propia; **no** crear un formulario universal a partir del esquema.
- Clientes, Básculas, Inventario, Movimientos, Marcas, Modelos y Proveedores tienen cada uno una pantalla de tabla/listado, sin conmutador tabla/lista. Clientes, Básculas e Inventario se crean/editan en páginas completas de detalle; Marcas, Modelos y Proveedores usan diálogos breves; Movimientos usa una página de detalle que muestra artículo, cantidad, tipo y efecto en stock. Un movimiento correctivo nuevo se inicia desde el detalle de la orden, con vínculo a orden fijo y de solo lectura, también validado en servidor; el formulario general de Movimientos crea movimientos sin asociación a orden. Flows automáticos pueden crear movimientos vinculados. La ubicación para editar movimientos existentes ya vinculados permanece pendiente en §6.
- Compartir UI de tabla, filtro y formulario sin copiar controles de negocio. Una colección nueva se agrega cuando haya una tarea real, con pruebas de acceso de dos usuarios; uniones (`order_scales`, `scales_files`) no requieren pantalla por sí mismas.
- `clients` incluye RFC/contacto: aislar sus consultas privadas de las públicas. `scales` permite gestionar básculas del cliente; `inventory` y `inventory_movements` atienden existencias y cambios. Perfil propio no implica administrar usuarios ajenos.

### 3.9 Orden, editor y preview

- `scales.client` nullable es relación propuesta, aún no creada; no inferir dueños previos. Elegir cliente filtra nuevas selecciones; mantener selecciones existentes y señalarlas incompatibles si se cambia cliente. No borrarlas silenciosamente; bloquear guardado/PDF hasta resolver y validar pertenencia en servidor. Una báscula inactiva existente y del mismo cliente sigue visible y puede pagarse en borrador, pero no se ofrece para nuevas selecciones. Si se reasigna a otro cliente tras pago, bloquear PDF hasta reparar.
- Si se borró excepcionalmente un cliente, báscula o parte referenciada, bloquear edición y PDF hasta restaurar o sustituir por registro válido; no soltar líneas ni asumir cascada. El personal no puede borrar físicamente registros privados, incluidos movimientos; solo admin con permisos efectivos puede hacerlo excepcionalmente. Personal con permiso efectivo de edición sí puede editar movimientos. Flujo de reparación de relaciones/datos faltantes es estrecho y disponible a personal autorizado aun fuera de draft, no habilita edición general de contenido no-draft. Mantener cliente↔báscula.
- Parte archivada ya vinculada sigue visible en orden/PDF, tanto si se archivó antes como después del pago; su cantidad puede cambiarse en draft y al pagar descuenta stock real tras validación. No permitir nueva selección mientras archivada. No confundir archivada con inexistente.
- Editor en escritorio con formulario a la izquierda y PDF/preview a la derecha; en móvil, formulario en `components/ui/drawer.tsx` accesible. Preview local refleja cambios sin guardar y advierte prominentemente; descarga de draft usa versión guardada y reautoriza. Paid y cancelled también descargables. Descargar en memoria, nunca persistir. Watermark CANCELADA opcional mediante `components/pdf/watermark.tsx`; etiqueta discreta de estado siempre visible en cualquier PDF (Borrador/Pagada/Cancelada, copia propuesta). Imprimir UUID completo `order.folio`, no consecutivo. Relaciones rotas o discrepancia de movimientos bloquean PDF. Elección browser/endpoint sigue sujeta a prueba técnica.
- Sin descuentos. IVA opcional 16% se decide y guarda por orden (su persistencia aún debe modelarse), distinto de visibilidad de cada descarga. Cuatro cargos manuales opcionales: mano de obra, horas extra, viáticos y otros. Subtotal = precios actuales × cantidades más cargos; IVA sobre subtotal; total calculado en MXN con dos decimales y base íntegra. Una orden puede pagarse sin refacciones, cargos ni precios; no bloquear por `inventory.price` `NULL` ni cero. Sin partes y sin cargos, subtotal y total quedan en blanco incluso al mostrar todo. Precio actual vivo, sin snapshot histórico. Si fila tiene precio `NULL`, importe y subtotal/IVA/total derivados quedan en blanco, nunca suma parcial; stock de las partes incluidas sí se descuenta. Cargo explícito `0.00` se imprime `$0.00` cuando visible. Ningún valor monetario aparece por defecto: ocultar unitarios, importes de fila, cuatro cargos, subtotal, IVA y total; mostrar individualmente por descarga y controles grupales «mostrar todos»/«ocultar todos los precios». No persistir visibilidad. Definir y probar el redondeo monetario.
- Preview y descarga reflejan datos vivos de Directus, también para órdenes `paid`; no son una copia histórica. Volver a consultar datos autorizados actuales en servidor al descargar; un borrador del navegador no es autoridad. Si falta un dato/relación requerido o hay denegación, no emitir PDF incompleto. El historial actual del backend no implica una UI paralela ni un snapshot del PDF.
- La regla de **solo editar en `draft`** aplica a cualquier documento, no a clientes, inventario o movimientos por ser colecciones de apoyo. Cualquier documento puede volver a `draft` desde otro estado con una transición explícita y permiso, pero cambiar el estado no autoriza editar contenido en la misma operación mientras aún no se haya validado el cambio. En Next.js se comprueba el estado al mostrar el editor y en cada mutación; la interfaz no sustituye la validación de estado y permisos en el servidor. El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js, y que cambios de contenido no-draft en `order_scales` y futuras líneas deben bloquearse por Studio/API salvo reparación autorizada y acotada. Esto requiere enforcement backend efectivo, aún no diseñado ni probado.
- `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). Se permiten `draft → cancelled`, `cancelled → draft`, `paid → draft`, `paid → cancelled` y directamente `cancelled → paid`. `draft → paid` confirma pago. Contenido normal solo editable en draft. `paid → draft` conserva movimientos del último pago confirmado; repagar concilia delta. Cancelar paid compensa neto; cancelled→paid directo concilia desde neto atribuido real. No se requieren fecha/monto/método de pago. Historial de cancelaciones ya existe según usuario; no duplicar. Flow actual «Movimientos Inventario» solo atiende CRUD de `inventory_movements`, no cambios de orden; Flow dedicado es recomendación, no decisión. Línea por artículo, cantidad entera positiva, cero líneas permitido; draft no reserva ni descuenta stock.
- Personal no puede borrar físicamente nada en el área; borrado excepcional solo por admin con permisos efectivos. Personal con permiso efectivo puede editar movimientos manualmente; normalmente corregir con movimiento compensatorio. La ubicación para editar movimientos existentes vinculados a órdenes sigue abierta: la pantalla general con permiso o solo lectura allí y edición/corrección desde detalle de orden. Si movimiento atribuido a orden se edita o se borra excepcionalmente, bloquear siguiente pago/cancelación y PDF hasta registrar compensación y volver a demostrar que los movimientos netos atribuidos coinciden con el último saldo confirmado de la orden (último pago, o cero después de cancelar); desbloqueo automático al reconciliar. Se permite `paid → draft` y editar contenido aunque exista discrepancia; siguen bloqueados PDF, repago o cancelación. Comparar movimientos atribuidos, no stock global; cambios de líneas draft no alteran baseline pagado. Reemplazar parte en paid requiere compensar retiro previo + debitar sustituta, validar stock y solo entonces desbloquear. Si falta permiso de movimientos o stock, queda bloqueado hasta que alguien autorizado complete; nunca saltar políticas.
- El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js; también deben bloquearse por Studio/API ediciones de contenido no-draft de `order_scales` y futuras líneas de orden, salvo reparación autorizada y acotada. Flow actual «Movimientos Inventario» no es order-aware. La documentación oficial de Directus indica que Filter puede pausar y Throw Error/rechazo de condición cancelar una transacción, pero eso no demuestra atomicidad de múltiples escrituras ni seguridad ante concurrencia en esta instancia. Preferencia del usuario: Flows primero; usar extensiones solo si no se puede probar atomicidad, idempotencia y concurrencia con Flows. Esto no autoriza crear un Flow dedicado ahora. La sugerencia previa de que permisos de pago generen movimientos automáticos sin permiso general de creación no fue aceptada; decidirlo en el diseño técnico. Cambio de receptor en mismo cliente exige nueva firma cliente antes de guardar/PDF; cambio de técnico, nueva firma técnico; cambio de cliente en paid, ambas firmas nuevas; sustituir báscula bajo mismo cliente no requiere re-firma. `SignaturePad` (`components/shared/forms/SignaturePad.tsx`) es la captura prevista en editor; emite trazos con `onChange`, exporta PNG/SVG; built-in save solo descarga local, no prueba integración con Directus. Mostrar únicamente firmante actual y anterior, con atribución precisa, texto «Anteriormente se habia firmado por: » en texto pequeño `text-muted-foreground` y equivalente PDF. Solo existen campos de firma actuales; historial/recuperación anterior requiere diseño, no asumir Directus revisions. Enlace orden-movimiento, detección de cambios/borrados, atomicidad, idempotencia, concurrencia y permisos siguen sin prueba. Stock se revalida al pagar; precio nulo/cero no impide pago.

## 4. Plan por etapas

### Etapa 0 — Cerrar el contrato de negocio y los permisos

`order.status` ya existe (`draft`, `paid`, `cancelled`; default `draft`, `NOT NULL`). Las transiciones de negocio están decididas: `draft → paid`, `draft → cancelled`, `cancelled → draft`, `cancelled → paid` directo, `paid → draft` y `paid → cancelled`. Contenido solo se edita en draft excepto reparación estrecha de relaciones/datos faltantes por personal con permisos efectivos. No hay borrado físico por personal; admin con permisos efectivos solo excepcionalmente. La entidad de líneas, `scales.client` y vínculo de movimientos a orden aún no existen. Una pregunta de producto continúa abierta: si movimientos ya vinculados a órdenes pueden editarse desde la pantalla general de Movimientos para quienes tienen permiso, o si son de solo lectura allí y su edición/corrección se realiza desde el detalle de la orden. Definir/probar detección de edición/borrado manual, baseline neto, compensación, atomicidad, idempotencia, concurrencia y permisos efectivos; esto requiere validación técnica, no reabre decisiones de negocio ya fijadas. Una línea por artículo, cantidad entera positiva, cero líneas permitidas; validar stock al pagar, sin reserva en draft. Precio vivo nullable de inventory; sin descuentos, cargos opcionales, IVA 16% elegido y guardado por orden, MXN 2 decimales. Permisos efectivos, despliegue, MFA y versión/configuración Directus solo se consultan con autorización. Preferencia Flows primero; Flow dedicado de orden no está autorizado y extensiones solo se consideran si Flows no prueban atomicidad/idempotencia/concurrencia.

**Salida:** contratos y migración revisables; sin asumir operaciones, estados, stock o permisos que no se verificaron.

### Etapa 1 — Sesión individual, dashboard y shell privado

Implementar cliente de sesión por solicitud, login/refresh/logout según modo probado, cookies `HttpOnly`, separación layout público/privado y dashboard con sidebar y configuración según §3.6. Probar dos pestañas, respuestas de refresh fuera de orden, logout concurrente y varias instancias; si no se demuestra seguridad, pedir nuevo login al expirar. Preservar rutas públicas y mantenimiento; nunca incluir datos privados en caché/inspector públicos.

### Etapa 2 — Lecturas y administración de recursos necesarios

Incorporar tipos/consultas/repositorios **privados** con campos explícitos y paginación para órdenes, clientes, básculas, inventario y movimientos; agregar tablas/listas, detalle, diálogos y búsqueda/paginación según §§3.6 y 3.8. `brands`, `models`, `suppliers` y firmas según dependencias verificadas. Navegación solo para módulos útiles y autorizados; operaciones y URL directa vuelven a autorizar. Separar «sin registros» de denegación y caída del servicio. No agregar `consecutives`.

### Etapa 3 — Modelo y ciclo de la orden

**Solo tras autorización de otros cambios de esquema/Flow:** incorporar `scales.client` nullable, la colección de líneas y vínculo de movimientos con orden. Las transiciones y sus resultados de negocio están decididos en §3.9; diseñar y demostrar controles técnicos, detección de discrepancias, reconciliación y escritura atómica/idempotente/concurrente. Revalidar stock al pagar y rechazar sin efectos parciales si falta. Aplicar reglas de reparación, firmas, referencias archivadas/inactivas y bloqueos de §3.9. No migrar dueños por inferencia. Personal nunca borra físicamente; admin solo excepcionalmente con permisos efectivos.

### Etapa 4 — Editor y PDF

Editor responsivo con validación y preview local; marcar cambios no guardados, pero descargar draft desde versión guardada con autorización nueva. Paid/cancelled muestran preview de solo lectura cuando la orden y sus referencias están íntegras y autorizadas; nunca dejar un preview anterior visible cuando una orden queda bloqueada. Probar valores monetarios ocultos por defecto, selección por valor y «ocultar todos», estado siempre visible, watermark cancelada opcional, UUID completo, NULL vs 0.00 y ausencia de sumas parciales. Probar firmas/atribución e historial previo; relaciones rotas y discrepancia de movimientos deben bloquear PDF. Elegir render browser o endpoint después de medir. PDF en memoria, no persistir en Directus. Probar contenido largo, todas las básculas, firmas y caracteres españoles.

### Etapa 5 — Evaluación posterior

Investigar `traceable` y `accredited` por separado; hoy el esquema inspeccionado solo prueba campos de auditoría. Identificar las fuentes reales antes de diseñar cálculos, informes, historia o aprobaciones. `consecutives` queda fuera, sin consultas, pantallas ni modificación de numeración.

## 5. Pruebas de aceptación imprescindibles

Además de validar UI responsive/configuración, probar búsqueda compartida de órdenes en el conjunto autorizado completo de la pestaña seleccionada y su paginación, sin exponer filas no autorizadas. Confirmar que ambas vistas conservan filtro/paginación, y que la tabla móvil desplaza solo su panel. Verificar que indicadores de corrección no alteran el estado y que filas no ofrecen acciones de pago/cancelación. Probar filtros de módulos/sidebar por permisos efectivos, avatar privado, menú de usuario limitado, preferencias solo locales y precedencia OS→selección local.

Con dos cuentas de prueba, **A y B**, cuyos permisos reales sean diferentes; estos son identificadores de prueba, no roles propuestos:

- A puede leer una orden O1; B no.
- A abre el detalle y descarga su PDF.
- B solicita **directamente** la URL de O1 y su endpoint PDF: no recibe datos ni bytes del documento.
- B conserva acceso a las órdenes que sí tenga permitidas.
- Ambos tienen diferencias comprobables de campos o relaciones: el PDF no recupera lo oculto mediante el token público.
- Visitante anónimo: redirección al login en páginas y respuesta no autorizada en el endpoint.
- O1 inexistente o no visible: respuesta que no revele su existencia.
- Al elegir cliente A, mostrar solo sus básculas; sin cliente asignado no aparecen. Cliente B con báscula de A: incompatibilidad visible, sin borrado silencioso; no guardar ni presentar PDF como válido. Cambiar la relación mientras se edita: rechazo completo por validación del servidor.
- Crear/editar según permisos efectivos de A y B; personal no puede borrar físicamente ningún registro, incluidos movimientos. Solo administrador autorizado puede borrar excepcionalmente. Probar que rechazo no se elude por URL/relación ni se convierte en lista vacía.
- Contenido normal solo se edita en `draft`; reparación estrecha de relaciones/datos faltantes se permite con permiso efectivo, incluso no-draft, pero no da edición general. Cada guardado requiere campos obligatorios, ambas firmas y báscula; sin intermedios inválidos. Decisiones: `cancelled → paid` directo permitido; paid→draft conserva movimientos del último pago confirmado; repago reconcilia delta; paid→cancelled compensa neto; cancelled→paid reconcilia desde neto atribuido. Personal puede editar movimientos con permiso, no borrarlos físicamente; borrado excepcional solo admin autorizado. Desviación en movimiento atribuido bloquea pago/cancelación/PDF hasta compensación y reconciliación automática; draft puede reabrirse/editar, baseline no cambia. Reintentos, atomicidad, detección, vínculo y concurrencia requieren prueba. Stock insuficiente rechaza pago sin parcialidad.
- Probar directamente por Studio/API que status tiene las mismas validaciones y efectos de stock que Next.js, y que contenido no-draft en `order_scales` y futuras líneas se rechaza salvo reparación autorizada y acotada. Las escrituras de pago/cancelación deben ser all-or-nothing: si falla movimiento, ni estado ni stock quedan parcialmente cambiados y el error se informa. Confirmar rollback y concurrencia en esta instancia; documentos de Directus por sí solos no son evidencia suficiente.
- Revocar permisos entre abrir detalle y descargar: reautorizar. PDF siempre indica estado; watermark de cancelada opcional; UUID completo. Datos no monetarios visibles por defecto, monetarios ocultos por defecto; controles individuales y «ocultar todos» cubren cada monto. No persistir visibilidad ni transformar denegación en ocultamiento. Precio NULL da fila/importe/totales derivados en blanco; cargo 0.00 visible da $0.00. Paid/cancelled descargables; draft descargado desde servidor guardado, preview local con aviso de cambios.
- Ejecutar solicitudes A/B intercaladas: sin contaminación por cliente, caché o estado.
- Expirar acceso, renovar, usar refresh inválido y simular Directus caído.
- Dos pestañas renovando; refresh simultáneo con logout; respuestas fuera de orden.
- Cambio de usuario en el mismo navegador y navegación atrás: sin datos privados residuales.
- POST desde otro origen y manipulación del destino de retorno: rechazados.
- PDF con texto largo, caracteres españoles y todas las básculas; tratar por separado báscula inactiva pero válida, parte archivada vinculada, parte/client/scale faltantes y scale reasignada a otro cliente. Parte archivada sigue visible y puede cambiarse en draft; no es nueva seleccionable. Relación rota bloquea edición/PDF hasta reparación válida, sin cascada silenciosa.
- Probar reparación de referencia por personal con permiso efectivo incluso no-draft, sin permitir edición general no-draft; parte pagada sustituida requiere compensar viejo retiro y debitar sustituta con stock disponible. Falta de permiso o stock mantiene bloqueo. Cambiar receptor exige nueva firma cliente; cambiar técnico, firma técnica; cliente pagado sustituido, ambas; báscula bajo mismo cliente no requiere re-firma. SignaturePad local download no equivale a upload Directus. Mostrar solo actual/anterior y texto exacto «Anteriormente se habia firmado por: » con estilo pequeño muted y atribución correcta. No asumir accesible historial Directus.
- Verificar que generar y descargar no crea archivos, relaciones, registros ni cambios de numeración en Directus.
- Regresión del sitio público y accesibilidad por teclado/móvil.

Primero se pueden usar mocks deterministas; **no sustituyen** las pruebas posteriores contra permisos reales en un entorno autorizado.

## 6. Históricos y validación pendiente

**Consultar datos históricos no equivale a reproducir exactamente un PDF anterior.**

Un PDF regenerado con datos actuales cambia si cambia la orden o la plantilla. Para reproducción exacta harían falta revisiones inmutables de datos, plantilla y recursos —o conservar el documento—. No se incorpora al alcance decidido; solo se reconsideraría si el usuario lo solicita explícitamente más adelante.

### Verificaciones no realizadas

- Snapshot/export local (no localizado). **El esquema vivo básico de `order`, `scales`, `traceable` y `accredited` sí se verificó por MCP**, pero no sus registros, datos históricos ni consistencia efectiva.
- Roles, políticas, MFA, TTL, versión y configuración efectiva de Directus.
- Identidad y privilegios del token público.
- Renovación concurrente contra la versión real del servidor.
- Renderizado, paginación, memoria y empaquetado WASM en Next.js.
- Pruebas, typecheck, lint, build y comprobación en navegador.

En la investigación inicial funcionó CodeGraph; la revisión posterior lo contrastó con Git y lecturas locales (757 archivos indexados, con advertencia de algún vínculo pendiente de sincronización). Directus Documentation MCP aportó documentación pública; **Directus MCP**, autorizado posteriormente por el usuario para investigar el esquema, aportó metadatos vivos mediante `schema`, `fields`, `relations` y `collections`, siempre en modo lectura. Ninguno de esos metadatos prueba los permisos de las cuentas de empleados.

### Estado de decisiones y pendientes

### Decisiones de producto confirmadas

`cancelled → paid` directo sí está permitido; ya se resolvieron descuentos, obligación de precio y borrado por personal. También están cerradas las reglas de estados, reparaciones, movimientos, firmas, monetización, PDF y referencias descritas en §3.9. La composición dashboard/sidebar, vistas, pestañas, búsqueda/paginación, catálogos, perfil y preferencias de §§3.6–3.8 se confirmaron en esta sesión.

### Pregunta de negocio aún abierta

**¿Los movimientos ya vinculados a órdenes se pueden editar desde la pantalla general de Movimientos para personal con permiso efectivo, o son de solo lectura allí y su edición/corrección se realiza desde el detalle de la orden?** La pregunta se planteó y quedó sin respuesta porque se pausó la sesión. No asumir ni resolverla por inferencia.

### Próximo trabajo: validación técnica, con autorización correspondiente

1. Diseñar/probar vínculo orden↔movimiento, baseline confirmado, detección de edición/borrado, compensación, atomicidad, idempotencia, concurrencia y desbloqueo automático; verificar permisos efectivos de Directus/Flow y no eludirlos.
2. Probar stock entero/no negativo y rechazo íntegro ante insuficiencia, incluida sustitución de parte pagada.
3. Resolver técnicamente historial/acceso de firmas previas, carga real de SignaturePad a Directus, selección de esquema/redondeo monetario y modo browser/endpoint de PDF; sin afirmar que revisions conservan archivos accesibles.
4. Verificar permisos efectivos, API enforcement, versión/configuración Directus y sesión solo con autorización específica. No consultar datos/usuarios/políticas ni editar Directus.
5. Sesión `json` vs `session`, render PDF, preview local/servidor y MFA siguen decisiones/validaciones técnicas necesarias, no nuevas preguntas de negocio. Histórico PDF inmutable no está acordado.
6. Resolver la pregunta pendiente de ubicación de edición de movimientos vinculados antes de fijar navegación y permisos de UI; no requiere volver a discutir reglas de conciliación ya confirmadas.

No se autoriza implementar código ni modificar esquema, datos, políticas o Flows. Flow dedicado de orden sigue sin decisión ni autorización. El cambio previo del Flow activo de cantidad fue autorizado, aplicado y leído de vuelta; la prueba satisfactoria reportada por el usuario no sustituye evidencia de logs/stock ni pruebas independientes.

La autorización anterior de MCP cubrió metadatos de esquema y lectura/actualización autorizada del Flow existente. Esta edición documental no crea ni modifica nada en Directus. Distinguir las reglas de producto ya acordadas, la pregunta de UI aún abierta y la factibilidad técnica aún no demostrada.

### Restricciones que se mantienen

- Autenticación y sesiones únicamente con Next.js y el SDK oficial de Directus; sin Better Auth, Auth.js, iron-session u otras bibliotecas externas de autenticación.
- Reutilizar dependencias de PDF y componentes pdfcn instalados, sin asumir disponibilidad de todo el catálogo.
- Reutilizar componentes y patrones existentes; sin funcionalidades ni abstracciones especulativas.
- No sacrificar seguridad, autorización, manejo de errores ni accesibilidad.
- Sin registro público de usuarios.
- Sin Gotenberg mientras no exista una limitación concreta que lo justifique.
- Sin build en esta tarea.
- La autorización de lectura de metadatos del esquema y actualización puntual del Flow de cantidad ya fue ejercida. No implica autorización para más cambios de Directus. Para acceder a datos, usuarios, políticas, credenciales o sesiones se requiere autorización explícita para ese alcance; nunca leer ni mostrar secretos.

**Riesgo principal:** permisos y sesión, integridad cliente-básculas, stock e idempotencia/concurrencia de movimientos. Deben comprobarse con usuarios distintos y datos aislados antes de habilitar operaciones privadas. La ubicación de edición de movimientos ya vinculados debe decidirse antes de cerrar ese flujo de interfaz.

## 7. Prompt para retomar en otro equipo

Copiar este bloque en una sesión nueva **con acceso al repositorio**. El plan viaja con el proyecto; la imagen original `C:\Users\benog\Downloads\order.jpg` y las capturas `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 140321.png` y `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 143437.png` están fuera del repo y pueden no existir en el otro equipo. Son referencias visuales; volver a pedirlas solo si hacen falta. En esta revisión `components/ui/sidebar.tsx` también figuraba sin seguimiento Git: comprobar que viaje con el proyecto.

```text
Quiero continuar la planificación del área privada de metrología. Leé primero AGENTS.md, las reglas .cursor/rules aplicables y docs/plans/area-privada-metrologia.md completo; el plan separado de errores/logger es docs/plans/directus-errors-logger.md y se implementará por separado. Revisá el estado actual del repositorio y no sobrescribas cambios ajenos.

Esta es una conversación de diseño: no implementes código, no crees/modifiques campos o Flows de Directus, no consultes registros, usuarios, políticas, archivos privados ni secretos sin mi autorización específica. Podés proponer consultas de metadatos de esquema si hacen falta y preguntarme primero cuando el alcance de acceso no esté claro. No supongas que permisos de Directus se infieren del esquema.

Decisiones confirmadas: el contenido de cualquier documento solo se edita en `draft`; desde cualquier otro estado se puede volver explícitamente a `draft` con permiso. Esto no implica que traceable/accredited tengan campo status. Next.js + SDK oficial de Directus, sesiones individuales y permisos efectivos; el usuario administra políticas. CRUD de órdenes y colecciones útiles (clientes, básculas, inventario, movimientos, etc.). scales son básculas de clientes, no inventory.type=equipments. Hace falta scales.client -> clients, nullable/propuesta y aún no creada; básculas sin cliente no aparecen. Si cambia el cliente de una orden, conservar selecciones incompatibles señaladas y bloquear guardado/PDF válido hasta resolverlas; revalidar en servidor. No inferir dueños anteriores.

UI confirmada: entrada privada en dashboard (no listado directo), tema oscuro fijo, sidebar izquierda agrupada Operación (Órdenes, Movimientos) y Catálogos (Clientes, Básculas, Inventario, Marcas, Modelos, Proveedores), filtrada por permisos efectivos. Órdenes con tabs Todas/Borradores/Pagadas/Canceladas, default Todas, `date_created DESC`, vista tabla/lista (desktop inicia tabla, móvil lista, preferencia local), búsqueda compartida folio+cliente con Fuse y `config/search.ts` sobre todo el conjunto autorizado en la tab seleccionada, y paginación del resultado. No métricas, precios ni acciones rápidas en filas; «Requiere corrección» es indicador, no estado. La solución de búsqueda remota del conjunto autorizado todavía debe diseñarse; helper Fuse y DataTable no resuelven por sí solos páginas remotas. Movimientos y catálogos tienen listado tabla únicamente; Clientes/Básculas/Inventario usan detalle completo; Marcas/Modelos/Proveedores diálogos breves; Movimientos detalle muestra artículo, cantidad, tipo y efecto stock. Movimiento correctivo nuevo se inicia en detalle de orden con vínculo fijo/read-only; formulario general crea sin vínculo; Flows pueden generar vinculados.

Footer sidebar muestra nombre/email/avatar privado display-only y menú solo Configuración/Cerrar sesión. Configuración tiene sidebar propia Apariencia/Perfil. Apariencia: tamaño de fuente Pequeño/Predeterminado/Grande y reducir movimiento, ambos solo por dispositivo; motion respeta OS antes de preferencia local. Sin selector de tema. Perfil: nombre, apellido, email, título; solo nombre/apellido/título editables, email read-only, sin contraseña ni rol; avatar read-only. Las capturas externas `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 140321.png` y `...143437.png` muestran colocación/composición, no características. Pueden faltar en el otro equipo.

El usuario informó que no había órdenes en ese momento; esto no fue comprobado mediante lectura de registros. `order.status` ya existe: `draft`, `paid`, `cancelled`, default `draft`, NOT NULL. Están permitidos `draft → cancelled`, `cancelled → draft`, `cancelled → paid` directo, `draft → paid`, `paid → draft` y `paid → cancelled`. No preguntar otra vez por `cancelled → paid`. `draft → paid` confirma pago; no se requieren fecha/monto/método. `paid → draft` conserva movimientos del último pago confirmado; repago concilia delta. `paid → cancelled` compensa neto. `cancelled → paid` reconcilia desde neto realmente atribuido. El historial de cancelaciones existe según el usuario; no crear historia duplicada ni asumir retención. Esta conversación no autoriza cambios de Directus.

Orden: folio UUID. Todo guardado, cualquier estado, requiere todos los campos marcados como obligatorios, ambas firmas presentes y al menos una báscula; puede tener cero refacciones. Las etiquetas de UI/metadata no prueban enforcement de API. description es un único texto general de servicio para todas las básculas; order.date_created es la fecha impresa; nombre del receptor y departamento se capturan manualmente en campos existentes. Una línea por artículo y orden es modelo propuesto aún no creado; cantidad entera positiva; draft no reserva ni descuenta. Revalidar stock al pagar y rechazar íntegramente si insuficiente. inventory.price es decimal(10,2), nullable, default NULL; no es requisito para pagar ni mostrar stock. Sin descuentos. IVA opcional de 16% se elige y persiste por orden, separado de visibilidad de descarga. MXN, dos decimales, precio actual vivo sin snapshot; cargos manuales opcionales: mano de obra, horas extra, viáticos y otros. Una orden puede pagarse sin líneas, cargos ni precios. Sin partes ni cargos, subtotal y total quedan en blanco incluso al mostrar todo. Si precio de línea NULL, importe y subtotal/IVA/total derivados en blanco, nunca parcial; cargo explícito 0.00 se imprime $0.00 si visible. Regla técnica de redondeo pendiente.

PDF: valores no monetarios disponibles visibles por defecto; todos los valores monetarios ocultos por defecto. Mostrar/ocultar cada valor por descarga —incluso los requeridos guardados, salvo el estado siempre visible— y controles grupales «mostrar todos»/«ocultar todos los precios» para unitarios, importes de línea, cuatro cargos, subtotal, IVA y total. Dejar vacías las casillas ocultas sin alterar estructura ni datos; no persistir visibilidad. Ocultar no es permiso ni representa fallos/denegaciones. Mostrar estado discreto siempre (Borrador/Pagada/Cancelada, copia propuesta); watermark CANCELADA opcional con `components/pdf/watermark.tsx`. UUID completo `order.folio`, no consecutivo. PDF de draft descargado usa versión guardada con autorización nueva; preview local muestra cambios no guardados con aviso prominente. Pagadas/canceladas tienen preview de solo lectura si están íntegras y autorizadas; no conservar un preview obsoleto si se bloquean. PDF en memoria. La imagen C:\Users\benog\Downloads\order.jpg puede no transferirse; logos en assets/logos/pdf.

Referencias y firmas: relación faltante bloquea edición/PDF hasta reparar, sin descartar líneas ni asumir cascade; restaurar original o sustituir por válido. Parte archivada enlazada sigue visible; cantidad editable en draft y descuenta stock al pagar, pero no ofrecer nuevas selecciones. Báscula inactiva existente del mismo cliente sigue visible/pagable; si se reasigna a otro cliente, bloquear PDF. Personal con permiso puede reparar relación aun no-draft, pero no editar contenido normal. Cambiar receptor en mismo cliente requiere nueva firma cliente antes de guardar/PDF; cambiar técnico, nueva firma técnica; sustituir cliente de orden pagada requiere ambas firmas nuevas; sustituir báscula bajo el mismo cliente no requiere firmas. Reemplazar parte pagada requiere compensar retiro previo y debitar sustituta, stock y permisos válidos. `SignaturePad` solo descarga local al guardar; no prueba upload a Directus. Mostrar firmante actual y anterior únicamente, atribución correcta y texto exacto «Anteriormente se habia firmado por: » pequeño y muted; no asumir revisiones/archivos históricos accesibles.

Esquema MCP (metadatos): order, order_scales, scales, clients, inventory e inventory_movements. Faltan scales.client y vínculo inventory_movements.order. Flow activo «Movimientos Inventario» maneja create/update/delete de inventory_movements y efectos de stock, no transiciones de order; su validación de nueva cantidad ya exige entero positivo y rechaza decimal/null/booleano/arrays en create/update, dejando intactos valores legados en update/delete. Readback confirmó la configuración; el usuario dijo que probó bien, pero no compartió stocks/logs. Esto no prueba atomicidad/rollback de operaciones múltiples, idempotencia o concurrencia. No volver a cambiarlo sin autorización.

Personal no puede borrar físicamente ningún registro privado, incluidos movimientos; borrado excepcional solo admin con permisos efectivos. Personal con permiso efectivo sí puede editar movimientos; corrección ordinaria compensatoria. Sigue abierta exactamente esta decisión: ¿los movimientos ya vinculados a órdenes se pueden editar desde Movimientos general con permiso, o son solo lectura allí y la edición/corrección va por detalle de orden? No la resuelvas por inferencia; fue preguntada y la sesión se pausó antes de respuesta. Si movimiento atribuido a orden se edita o borra excepcionalmente, siguiente pago/cancelación y PDF quedan bloqueados hasta registrar compensación y volver a verificar el neto atribuido frente al último saldo confirmado (último pago, o cero tras cancelar); auto-desbloqueo al reconciliar. paid→draft y edición se permiten pese a discrepancia, sin cambiar baseline; quedan bloqueados PDF, repago/cancelación. Comparar atribuidos, no stock global. Enlace orden-movimiento, detección de ediciones/borrados, atomicidad, idempotencia, concurrencia y permisos efectivos aún requieren diseño/prueba técnica, no son incertidumbre de negocio. Flow dedicado de orden es recomendación solamente. No se verificaron permisos reales, API enforcement, versión/configuración, refresh concurrente ni render PDF. No consultar datos, usuarios, políticas, archivos privados o secretos sin permiso específico. Mantener cliente público staticToken/caché separado de privados, no usar respuesta [] en errores. traceable/accredited quedan para después; consecutives excluida. Plan de logger/errores separado: docs/plans/directus-errors-logger.md.

La única pregunta de negocio pendiente es exactamente: ¿los movimientos ya vinculados a órdenes pueden editarse desde la pantalla general de Movimientos para personal con permiso efectivo, o allí son de solo lectura y su edición/corrección se hace desde el detalle de la orden? La pregunta ya se hizo y quedó sin respuesta porque se pausó la sesión. No afirmar que no quedan preguntas ni inventar otra. Tras resolverla, proponer validaciones técnicas concretas de vínculo/detección/reconciliación, atomicidad/idempotencia/concurrencia, permisos, referencias e historial de firma, redondeo y render/autorización de PDF; marcar cada una como no verificada. El usuario confirmó que Studio/API debe aplicar las mismas validaciones/efectos a `order.status` que Next.js y bloquear contenido no-draft de `order_scales`/futuras líneas salvo reparación autorizada. Directus Filter/Throw Error no demuestra atomicidad multi-write/concurrencia en esta instancia. Preferencia: Flows primero; extensiones solo si Flows no pueden probar atomicidad/idempotencia/concurrencia. No crear Flow dedicado sin autorización. La actualización Flow de cantidad ya fue autorizada y aplicada; no es autorización para más cambios. No consultar registros, usuarios, políticas, archivos privados o secretos ni modificar backend/Directus o implementar código sin autorización específica. Actualiza el plan solo si el usuario vuelve a autorizar edición documental.
```
