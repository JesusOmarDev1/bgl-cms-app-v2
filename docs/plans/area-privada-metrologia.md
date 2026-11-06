# Plan para el área privada de metrología

Estado: planificación y decisiones de producto; esta actualización **solo edita este documento** y no autoriza código, nuevas operaciones de Directus ni lectura de registros privados. Una validación de cantidad ya aplicada con autorización al Flow activo se describe en §2; sus pruebas end-to-end y propiedades de atomicidad siguen sin verificarse. El manejo de errores y el logger se planifican por separado en [directus-errors-logger.md](directus-errors-logger.md).
Alcance: área privada para gestionar órdenes de servicio y las colecciones que realmente facilitan ese trabajo, mediante permisos individuales efectivos. `traceable` y `accredited` se evalúan después; `consecutives` permanece excluida.

**Lectura rápida:** el esquema vivo confirma `order`, `order_scales`, `scales`, `clients`, `inventory` e `inventory_movements`; `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). El usuario informó que aún no había órdenes al momento de la conversación; no se consultaron registros. El modelo de líneas de refacciones, `scales.client` y el vínculo de movimientos a órdenes siguen sin crearse. `inventory.price` es decimal(10,2), nullable, default `NULL`. Las decisiones de producto y UI confirmadas están abajo, incluida la obligatoriedad futura de `supplier` para todo `entry` y `client` para todo `withdrawal`, independientemente de `status`. La forma técnica de garantizar transiciones, atomicidad, idempotencia y concurrencia no está demostrada. No se verificaron permisos efectivos, enforcement API, rollback integral, historial de firmas ni renderizado final.

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
- Editor de orden y propuesta preferida de PDF generado en el navegador con Forme y componentes pdfcn locales; no se ha demostrado aún que ese flujo funcione en esta aplicación. Cada descarga requiere reautorización y lectura de la versión guardada en el servidor. El PDF no se sube a Directus; la integración de firmas con `directus_files` se valida aparte.
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

El avance previo del `DateRangePicker` tiene cuatro pruebas enfocadas que pasaron. Un typecheck anterior falló por errores no relacionados de módulos `pdf-theme` ausentes; esto no constituye una verificación completa del proyecto. No hay resultado global completo ni se ejecutó un build fresco en esta actualización documental; tampoco se probó la ruta de órdenes, que aún no existe.

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

Login, logout y refresh son operaciones POST en Server Actions separadas: `services/domain/server/auth/login.ts`, `logout.ts` y `refresh.ts`. Cada módulo usa `"use server"` y el SDK oficial de Directus, siguiendo `services/domain/server/form/submit-form.ts`. No crear Route Handlers por colección ni duplicar lógica de autenticación; compartir únicamente un helper real de credenciales/cookies por solicitud si hace falta. Login valida credenciales e ingreso al área; refresh y logout validan la sesión correspondiente. Todas aplican protección CSRF/origen según corresponda, respetan MFA cuando aplique, devuelven errores redactados y nunca aceptan autoridad/permisos enviados por el navegador.

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
   - Refresh no se ejecuta durante el render de un Server Component ni escribe cookies desde ese render.
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
- Login, refresh y logout son operaciones POST mediante las Server Actions separadas de auth; usar Next `cookies()` en el contexto permitido para gestionar las cookies. Validar sesión, CSRF/origen cuando corresponda y autorización en cada operación. Las Server Actions incorporan comparación `Origin`/`Host`, pero siguen necesitando autenticación y autorización.
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

No se propone una ruta API por colección ni una ruta PDF dedicada. Separar login del layout protegido para evitar ciclos de redirección. La entrada privada es un dashboard con navegación a la izquierda y contenido ocupando el resto. Diseño oscuro fijo conforme a `DESIGN.md`, reutilizando `components/ui/sidebar.tsx`; las capturas externas son referencias de agrupación/ubicación, no especificación literal de colores ni contenido.

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

- El footer muestra nombre/email y avatar privado autorizado desde Directus, solo de presentación, con `components/ui/avatar.tsx` y fallback de iniciales; nunca usar token público para el asset. El menú de `components/ui/dropdown-menu.tsx` contiene únicamente Configuración y Cerrar sesión. No incluir Upgrade, Billing, Notifications ni un enlace Config separado.
- Configuración tiene sidebar vertical propia, con Apariencia y Perfil. Apariencia ofrece únicamente tamaño de fuente Pequeño/Predeterminado/Grande mediante `components/ui/radio-group.tsx` y movimiento reducido on/off; sin selector de tema. Antes de una elección local, respetar `prefers-reduced-motion`; la elección local la sobreescribe. Ambas preferencias se guardan solo en el dispositivo, no en Directus.
- Perfil muestra nombre, apellido, email y título. Solo nombre, apellido y título son editables; email y avatar son de solo lectura. No mostrar ni editar contraseña, rol u otros datos sensibles.
- Las capturas externas pueden faltar en otro equipo y solo muestran composición/colocación, no características de producto. Ocultar enlaces no sustituye autorización en servidor. Mantener tema oscuro y estado activo neutral; drawer accesible con título, foco inicial/de retorno, Escape y teclado, `aria-current` y enlace para saltar al contenido.

### 3.7 PDF actual, descargable y no persistido

**Propuesta preferida, pendiente de prueba:** usar pdfcn en el navegador para previsualizar y generar la descarga, sin un Route Handler específico de la aplicación. La referencia pública de [pdfcn](https://www.pdfcn.dev/llms.txt) muestra un control de descarga; no demuestra autorización ni seguridad para documentos privados. `@formepdf/core` v0.25.0 expone `renderDocument(element): Promise<Uint8Array>` en `dist/browser.d.ts`, pero no se ha probado aquí el renderizado browser ni la integración con Next.js.

En cada acción **Descargar**:

1. Una operación de servidor valida sesión, ID y permisos efectivos, y vuelve a leer la orden **guardada** con sus campos, relaciones y archivos necesarios, usando la identidad del empleado.
2. Si la orden o cualquier dato requerido no está disponible o autorizado, rechazar la descarga completa; nunca producir un PDF parcial ni tratar una denegación como un campo oculto.
3. Enviar al navegador solo los datos y bytes de archivos autorizados y necesarios para ese documento; no enviar URLs públicas de firmas ni URLs arbitrarias.
4. Generar el PDF en memoria en el navegador y descargarlo. No crear registros, subir archivos ni persistir el PDF en Directus.

El preview puede reflejar ediciones locales aún no guardadas, con aviso prominente, pero **nunca será la fuente de una descarga**. No conservar un preview descargable tras revocar permisos o detectar que la orden quedó bloqueada; volver a autorizar antes de cada descarga. No usar URL pública de firma ni token público para resolver assets. Validar autorización por cada archivo, tipo/tamaño y transferencia mínima necesaria.

La alternativa de Route Handler solo se reconsidera si pruebas medidas de WASM, bundle, memoria, rendimiento, transferencia de assets o seguridad muestran una limitación concreta del navegador. No se fija endpoint ni se presuponen headers de respuesta para esa alternativa.

**Firmas:** `PdfSignatureBlock` es un bloque visual, no una prueba de aprobación. El motor instalado sí expone `certifyPdf()` (`node_modules/@formepdf/core/dist/index.d.ts:279`), pero no hay evidencia de certificados o un proceso autorizado. No incorporarlo al MVP sin un requisito explícito. Mostrar la firma actual y solo el nombre de la persona firmante inmediatamente anterior; nunca mostrar la imagen de su firma anterior. Un cambio real de firmante exige capturar una firma nueva antes de guardar o descargar. Persistir nombres previos por firmante es una propuesta mínima pendiente de verificar contra metadatos/campos disponibles; no asumir campos existentes ni revisiones de Directus.

**Imágenes privadas:** no usar directamente las URL públicas de `getAssetUrl()` para firmas ni confiar en que el renderer autentique `fetch` por sí mismo. El servidor debe leer cada archivo necesario con la identidad del empleado, aplicar permisos y límites de tipo/tamaño y transferir solo sus bytes autorizados al navegador como datos en memoria. No aceptar URLs arbitrarias ni exponer URLs firmadas/públicas.

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
- Para cada tarea, definir los campos/relaciones y consultas explícitas que realmente necesita, reutilizando los patrones existentes. Crear operaciones/repositorios solo cuando aporten una necesidad concreta; no añadir por defecto una capa de repositorio por colección. Cada mutación valida en servidor permisos, límites de campos y estado. `order` conserva su lógica propia; **no** crear un formulario universal a partir del esquema.
- Clientes, Básculas, Inventario, Movimientos, Marcas, Modelos y Proveedores tienen cada uno una pantalla de tabla/listado, sin conmutador tabla/lista. Clientes, Básculas e Inventario se crean/editan en páginas completas de detalle; Marcas, Modelos y Proveedores usan diálogos breves; Movimientos usa una página completa propia y muestra artículo, cantidad, tipo, stock anterior/posterior previsto y efecto en stock. Crear una retirada requiere confirmación; crear una entrada solo preview y Guardar; editar cualquier movimiento existente requiere confirmación. El servidor vuelve a validar al guardar. La clasificación (entrada/retirada) se elige explícitamente y no se infiere del estado; notas son siempre opcionales. La pantalla general muestra todos los movimientos autorizados y el origen/enlace de orden; los vinculados son de solo lectura allí. Su edición/corrección solo se inicia desde detalle de orden con permisos efectivos y vínculo fijo/solo lectura, validado también en servidor. La creación desde listado general siempre queda independiente/sin orden; el empleado de almacén con permiso efectivo puede crear movimientos independientes sin orden. El vínculo de un movimiento independiente queda sin asignar. No exigir permiso de pago para estas creaciones independientes. Flows pueden crear movimientos vinculados. `inventory_movements.notes` son notas del movimiento, distintas de `inventory.notes` (notas del artículo).
- Reutilizar `components/ui/{table,item,sidebar,tabs,pagination,drawer}.tsx` y `components/shared/forms/{DateRangePicker,SignaturePad}.tsx` allí donde las pantallas realmente los consuman. Extraer primitivas de presentación compartidas después de observar usos repetidos; no crear por defecto formularios genéricos CRUD/schema-driven ni capas de repositorio por colección. Mantener separadas las reglas de autorización, stock, órdenes y PDF. Una colección nueva se agrega cuando haya una tarea real, con pruebas de acceso de dos usuarios; uniones (`order_scales`, `scales_files`) no requieren pantalla por sí mismas.
- `clients` incluye RFC/contacto: aislar sus consultas privadas de las públicas. `scales` permite gestionar básculas del cliente; `inventory` y `inventory_movements` atienden existencias y cambios. Perfil propio no implica administrar usuarios ajenos.
- **Movimientos de préstamo:** `inventory_movements.status` incluye `sold`, `reserved`, `on_hold`, `defective`, `damaged`, `returned`, `decommissioned` y `loan` (loan añadido y verificado). `returned` significa devolución defectuosa al proveedor, no devolución de préstamo. Entrega = nuevo `withdrawal` con status `loan`; devolución = nuevo `entry` con status `loan`, preservando el original. Tipo explícito, no inferido del status ni emparejado automáticamente con el movimiento original. El flujo observado suma en entry y resta en withdrawal; status/notas no cambian el efecto. Notas siempre opcionales. No prometer relación formal préstamo/devolución, saldo pendiente ni guardia contra devolución excesiva. `inventory_movements.notes` es distinto de `inventory.notes`.
- **Regla de cliente/proveedor confirmada:** todo `type = entry` requiere un proveedor real (`supplier`) y todo `type = withdrawal` requiere un cliente real (`client`), cualquiera que sea `status`; no inventar identidades ni crear excepciones basadas en status. Por tanto, la devolución de préstamo (`entry`, `status = loan`) requiere proveedor; la devolución defectuosa al proveedor (`withdrawal`, `status = returned`) requiere cliente y no proveedor. Un movimiento independiente `withdrawal` por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real se rechaza: no se inventa cliente ni se omite el requisito. No asumir que una devolución de préstamo se vincula al movimiento de entrega original.
- Metadatos leídos de `inventory_movements.supplier` y `.client`: ambos son relaciones UUID M2O, respectivamente a `suppliers` y `clients`. Ambos tienen `meta.required = true` en configuración base; la condición `type != entry` para supplier y `type != withdrawal` para client los vuelve `readonly=true`, `required=false`, `hidden=true` y `clear_hidden_value_on_save=true`. Ambas columnas son nullable y tienen `meta.validation = null`. `type` ofrece las opciones `entry` y `withdrawal` y la columna también es nullable. Estas condiciones describen configuración de Studio y no prueban enforcement API. En la futura UI/validación, exigir la relación que corresponde al tipo, sin variar la regla por `status`; validar también en servidor. Las pruebas aisladas de escritura API se difieren expresamente para más adelante y no están realizadas; cuando se autoricen, incluir cambio de tipo en update, limpieza de relación opuesta, relación ausente/null, tipo inválido y, donde aplique, cliente derivado de una orden vinculada. No inventar reglas adicionales para el cliente derivado de orden. No modificar backend ni tratar metadata Studio como requisito de base/API.

### 3.9 Orden, editor y preview

- `scales.client` nullable es relación propuesta, aún no creada; no inferir dueños previos. Elegir cliente filtra nuevas selecciones; mantener selecciones existentes y señalarlas incompatibles si se cambia cliente. No borrarlas silenciosamente; bloquear guardado/PDF hasta resolver y validar pertenencia en servidor. Una báscula inactiva existente y del mismo cliente sigue visible y puede pagarse en borrador, pero no se ofrece para nuevas selecciones. Si se reasigna a otro cliente tras pago, bloquear PDF hasta reparar.
- Si se borró excepcionalmente un cliente, báscula o parte referenciada, bloquear edición y PDF hasta restaurar o sustituir por registro válido; no soltar líneas ni asumir cascada. El personal no puede borrar físicamente registros privados, incluidos movimientos; solo admin con permisos efectivos puede hacerlo excepcionalmente. Personal con permiso efectivo de edición sí puede editar movimientos. Flujo de reparación de relaciones/datos faltantes es estrecho y disponible a personal autorizado aun fuera de draft, no habilita edición general de contenido no-draft. Mantener cliente↔báscula.
- Parte archivada ya vinculada sigue visible en orden/PDF, tanto si se archivó antes como después del pago; su cantidad puede cambiarse en draft y al pagar descuenta stock real tras validación. No permitir nueva selección mientras archivada. No confundir archivada con inexistente.
- Editor en escritorio con formulario a la izquierda y PDF/preview a la derecha; en móvil, formulario en `components/ui/drawer.tsx` accesible. Preview local refleja cambios sin guardar y advierte prominentemente; descarga de draft usa versión guardada y reautoriza. Paid y cancelled también descargables. Descargar en memoria, nunca persistir. Watermark CANCELADA opcional mediante `components/pdf/watermark.tsx`; etiqueta discreta de estado siempre visible en cualquier PDF (Borrador/Pagada/Cancelada, copia propuesta). Imprimir UUID completo `order.folio`, no consecutivo. Relaciones rotas o discrepancia de movimientos bloquean PDF. Renderizado en navegador es la propuesta preferida, aún pendiente de prueba; Route Handler solo se evalúa si mediciones muestran una limitación concreta.
- Sin descuentos. IVA opcional 16% se decide y guarda por orden (su persistencia aún debe modelarse), distinto de visibilidad de cada descarga. Cuatro cargos manuales opcionales: mano de obra, horas extra, viáticos y otros. Subtotal = precios actuales × cantidades más cargos; IVA sobre subtotal; total calculado en MXN con dos decimales y base íntegra. Una orden puede pagarse sin refacciones, cargos ni precios; no bloquear por `inventory.price` `NULL` ni cero. Sin partes y sin cargos, subtotal y total quedan en blanco incluso al mostrar todo. Precio actual vivo, sin snapshot histórico. Si fila tiene precio `NULL`, importe y subtotal/IVA/total derivados quedan en blanco, nunca suma parcial; stock de las partes incluidas sí se descuenta. Cargo explícito `0.00` se imprime `$0.00` cuando visible. Ningún valor monetario aparece por defecto: ocultar unitarios, importes de fila, cuatro cargos, subtotal, IVA y total; mostrar individualmente por descarga y controles grupales «mostrar todos»/«ocultar todos los precios». No persistir visibilidad. Definir y probar el redondeo monetario.
- La descarga refleja datos guardados y autorizados actuales de Directus, también para órdenes `paid`; no es una copia histórica. En cada descarga, volver a autorizar y consultar en servidor con la identidad del empleado; un borrador del navegador no es autoridad. El preview, en cambio, puede reflejar ediciones locales sin guardar con aviso prominente. Si falta un dato/relación requerido o hay denegación, no emitir PDF incompleto ni conservar preview obsoleto tras revocación/bloqueo. El historial actual del backend no implica una UI paralela ni un snapshot del PDF.
- La regla de **solo editar en `draft`** aplica a cualquier documento, no a clientes, inventario o movimientos por ser colecciones de apoyo. Cualquier documento puede volver a `draft` desde otro estado con una transición explícita y permiso, pero cambiar el estado no autoriza editar contenido en la misma operación mientras aún no se haya validado el cambio. En Next.js se comprueba el estado al mostrar el editor y en cada mutación; la interfaz no sustituye la validación de estado y permisos en el servidor. El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js, y que cambios de contenido no-draft en `order_scales` y futuras líneas deben bloquearse por Studio/API salvo reparación autorizada y acotada. Esto requiere enforcement backend efectivo, aún no diseñado ni probado.
- `order.status` existe (`draft`, `paid`, `cancelled`, default `draft`, `NOT NULL`). Se permiten `draft → cancelled`, `cancelled → draft`, `paid → draft`, `paid → cancelled` y directamente `cancelled → paid`. `draft → paid` confirma pago. Contenido normal solo editable en draft. `paid → draft` conserva movimientos del último pago confirmado; repagar concilia delta. Cancelar paid compensa neto; cancelled→paid directo concilia desde neto atribuido real. No se requieren fecha/monto/método de pago. Historial de cancelaciones ya existe según usuario; no duplicar. Flow actual «Movimientos Inventario» solo atiende CRUD de `inventory_movements`, no cambios de orden; Flow dedicado es recomendación, no decisión. Línea por artículo, cantidad entera positiva, cero líneas permitido; draft no reserva ni descuenta stock.
- Personal no puede borrar físicamente nada en el área; borrado excepcional solo por admin con permisos efectivos. Personal con permiso efectivo puede editar movimientos manualmente; normalmente corregir con movimiento compensatorio. La lista general muestra todos los movimientos autorizados con origen/enlace de orden; los vinculados son read-only allí. Edición/corrección solo desde detalle de orden con permisos efectivos, vínculo fijo y validación server-side. Crear desde la lista general siempre es independiente/sin orden. Si movimiento atribuido a orden se edita o se borra excepcionalmente, bloquear siguiente pago/cancelación y PDF hasta registrar compensación y volver a demostrar que los movimientos netos atribuidos coinciden con el último saldo confirmado de la orden (último pago, o cero después de cancelar); desbloqueo automático al reconciliar. Se permite `paid → draft` y editar contenido aunque exista discrepancia; siguen bloqueados PDF, repago o cancelación. Comparar movimientos atribuidos, no stock global; cambios de líneas draft no alteran baseline pagado. Reemplazar parte en paid requiere compensar retiro previo + debitar sustituta, validar stock y solo entonces desbloquear. Si falta permiso de movimientos o stock, queda bloqueado hasta que alguien autorizado complete; nunca saltar políticas.
- El usuario confirmó que cambios directos de `order.status` por Studio/API deben aplicar las mismas validaciones y efectos de stock que Next.js; también deben bloquearse por Studio/API ediciones de contenido no-draft de `order_scales` y futuras líneas de orden, salvo reparación autorizada y acotada. Flow actual «Movimientos Inventario» no es order-aware. La documentación oficial de Directus indica que Filter puede pausar y Throw Error/rechazo de condición cancelar una transacción, pero eso no demuestra atomicidad de múltiples escrituras ni seguridad ante concurrencia en esta instancia. Preferencia del usuario: Flows primero; usar extensiones solo si no se puede probar atomicidad, idempotencia y concurrencia con Flows. Esto no autoriza crear un Flow dedicado ahora. **Decisión de permisos para pagar:** para confirmar un pago que necesita crear movimientos de inventario, la persona debe tener ambos permisos efectivos de Directus: pagar/cambiar la orden y crear los movimientos necesarios. Si falta cualquiera, rechazar el pago completo sin efectos parciales sobre stock ni visibilidad/estado de la orden; no conceder implícitamente creación limitada a esa orden ni eludir Directus. La regla ya aplica también a reparaciones/conciliaciones que necesiten crear movimientos. Si no se necesita crear ningún movimiento (por ejemplo, orden sin refacciones), no exigir permiso de creación que no se usa. Las creaciones independientes de la pantalla general requieren permiso efectivo de creación de movimientos, pero no permiso de pago. Cambio de receptor en mismo cliente exige nueva firma cliente antes de guardar/PDF; cambio de técnico, nueva firma técnico; cambio de cliente en paid, ambas firmas nuevas; sustituir báscula bajo mismo cliente no requiere re-firma. `SignaturePad` (`components/shared/forms/SignaturePad.tsx`) es la captura prevista en editor; emite trazos con `onChange`, exporta PNG/SVG; built-in save solo descarga local, no prueba integración con Directus. Mostrar la imagen de la firma actual y solo el nombre del firmante inmediatamente anterior, con atribución precisa; nunca la imagen de la firma previa. Usar exactamente «Anteriormente se habia firmado por: » en texto pequeño `text-muted-foreground` y su equivalente en PDF. Un cambio real de firmante exige una firma nueva antes de guardar/descargar. Solo se conocen campos actuales de firma; persistir el nombre previo por firmante es una propuesta mínima pendiente de confirmar con metadatos, no un campo existente confirmado ni una suposición de Directus revisions. Enlace orden-movimiento, detección de cambios/borrados, atomicidad, idempotencia, concurrencia y permisos siguen sin prueba. Stock se revalida al pagar; precio nulo/cero no impide pago.

## 4. Plan por etapas

### Etapa 0 — Cerrar el contrato de negocio y los permisos

`order.status` ya existe (`draft`, `paid`, `cancelled`; default `draft`, `NOT NULL`). Las transiciones de negocio están decididas: `draft → paid`, `draft → cancelled`, `cancelled → draft`, `cancelled → paid` directo, `paid → draft` y `paid → cancelled`. Contenido solo se edita en draft excepto reparación estrecha de relaciones/datos faltantes por personal con permisos efectivos. No hay borrado físico por personal; admin con permisos efectivos solo excepcionalmente. La entidad de líneas, `scales.client` y vínculo de movimientos a orden aún no existen. La política de movimientos vinculados ya está resuelta: todos los autorizados se listan con origen/enlace y son read-only en la lista general; edición/corrección solo desde detalle de orden con permisos efectivos. Crear desde listado general siempre es independiente. Regla confirmada: todo `entry` requiere supplier real y todo `withdrawal` requiere client real, cualquiera que sea `status`; un `withdrawal` independiente por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real se bloquea. §3.8 distingue la regla de UI de metadatos Studio; enforcement API sigue sin probarse y el usuario difiere expresamente esas pruebas para después. Para pagar una orden que requiere crear movimientos se exigen ambos permisos efectivos (pago de orden y creación de movimientos); si falta uno, rechazo completo sin efectos parciales. No se requiere permiso de creación cuando no hay movimientos que crear. Los movimientos independientes se pueden crear sin orden con permiso efectivo de creación, sin exigir permiso de pago. Definir/probar detección de edición/borrado manual, baseline neto, compensación, atomicidad, idempotencia, concurrencia y permisos efectivos; esto requiere validación técnica, no reabre decisiones de negocio ya fijadas. Una línea por artículo, cantidad entera positiva, cero líneas permitidas; validar stock al pagar, sin reserva en draft. Precio vivo nullable de inventory; sin descuentos, cargos opcionales, IVA 16% elegido y guardado por orden, MXN 2 decimales. Permisos efectivos, despliegue, MFA y versión/configuración Directus solo se consultan con autorización. Preferencia Flows primero; Flow dedicado de orden no está autorizado y extensiones solo se consideran si Flows no prueban atomicidad/idempotencia/concurrencia.

**Salida:** contratos y migración revisables; sin asumir operaciones, estados, stock o permisos que no se verificaron.

### Etapa 1 — Sesión individual, dashboard y shell privado

Implementar cliente de sesión por solicitud, login/refresh/logout según modo probado, cookies `HttpOnly`, separación layout público/privado y dashboard con sidebar y configuración según §3.6. Probar dos pestañas, respuestas de refresh fuera de orden, logout concurrente y varias instancias; si no se demuestra seguridad, pedir nuevo login al expirar. Preservar rutas públicas y mantenimiento; nunca incluir datos privados en caché/inspector públicos.

### Etapa 2 — Lecturas y administración de recursos necesarios

Incorporar tipos/consultas/repositorios **privados** con campos explícitos y paginación para órdenes, clientes, básculas, inventario y movimientos; agregar tablas/listas, detalle, diálogos y búsqueda/paginación según §§3.6 y 3.8. `brands`, `models`, `suppliers` y firmas según dependencias verificadas. Navegación solo para módulos útiles y autorizados; operaciones y URL directa vuelven a autorizar. Separar «sin registros» de denegación y caída del servicio. No agregar `consecutives`.

### Etapa 3 — Modelo y ciclo de la orden

**Solo tras autorización de otros cambios de esquema/Flow:** incorporar `scales.client` nullable, la colección de líneas y vínculo de movimientos con orden. Las transiciones y sus resultados de negocio están decididos en §3.9; diseñar y demostrar controles técnicos, detección de discrepancias, reconciliación y escritura atómica/idempotente/concurrente. Para un pago que necesite crear movimientos, exigir simultáneamente permisos efectivos para pagar la orden y crear movimientos; ante permiso faltante rechazar la operación completa sin cambios parciales de stock o estado. No exigir permiso de creación si no se crea ningún movimiento. Revalidar stock y rechazar sin efectos parciales si falta. Aplicar reglas de reparación, firmas, referencias archivadas/inactivas y bloqueos de §3.9. No migrar dueños por inferencia. Personal nunca borra físicamente; admin solo excepcionalmente con permisos efectivos.

### Etapa 4 — Editor y PDF

Editor responsivo con preview local que marca cambios no guardados; cada descarga, también la de draft, vuelve a autorizar y usa solo la versión guardada recuperada por el servidor. Preferir renderizado y descarga en navegador; aún no está probado. Paid/cancelled muestran preview de solo lectura cuando la orden y sus referencias están íntegras y autorizadas; limpiar/bloquear preview tras revocación o bloqueo. Probar autorización y transferencia mínima de datos/assets, WASM, bundle y memoria. Probar valores monetarios ocultos por defecto, selección por valor y «ocultar todos», estado siempre visible, watermark cancelada opcional, UUID completo, NULL vs 0.00 y ausencia de sumas parciales. Probar atribución de firmas: firma actual visible, solo nombre del firmante previo, nunca imagen previa; cambio real de firmante exige firma nueva. Relaciones rotas y discrepancia de movimientos bloquean PDF completo. Considerar Route Handler solo si mediciones del navegador prueban una limitación concreta. PDF en memoria, no persistir en Directus. Probar contenido largo, todas las básculas y caracteres españoles.

### Etapa 5 — Evaluación posterior

Investigar `traceable` y `accredited` por separado; hoy el esquema inspeccionado solo prueba campos de auditoría. Identificar las fuentes reales antes de diseñar cálculos, informes, historia o aprobaciones. `consecutives` queda fuera, sin consultas, pantallas ni modificación de numeración.

## 5. Pruebas de aceptación imprescindibles

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
- Revocar permisos entre abrir detalle y descargar: la operación de servidor reautoriza y vuelve a leer la orden guardada y los archivos necesarios; el navegador no descarga desde preview local ni desde datos antiguos. Denegación, relación rota o dato requerido ausente bloquean todo el PDF, sin documento parcial ni preview obsoleto. Enviar al cliente solo datos/assets autorizados mínimos; nunca URL pública de firma. Verificar que no haya acceso tras revocación, ni persistencia/almacenamiento del PDF. Preferencia browser pendiente de prueba; medir WASM, bundle, memoria, transferencia de assets y seguridad. Solo si esas mediciones muestran un límite concreto, evaluar Route Handler como alternativa.
- PDF siempre indica estado; watermark de cancelada opcional; UUID completo. Datos no monetarios visibles por defecto, monetarios ocultos por defecto; controles individuales y «ocultar todos» cubren cada monto. No persistir visibilidad ni transformar denegación en ocultamiento. Precio NULL da fila/importe/totales derivados en blanco; cargo 0.00 visible da $0.00. Paid/cancelled descargables; draft se descarga desde datos guardados en servidor, mientras preview local avisa de cambios sin guardar.
- Probar firmas: mostrar firma actual y nombre del firmante previo, nunca imagen previa; cambio real de firmante exige firma nueva. Verificar el almacenamiento propuesto de nombres previos, sin asumir campo/revisions ya existentes.
- Ejecutar solicitudes A/B intercaladas: sin contaminación por cliente, caché o estado.
- Expirar acceso, renovar, usar refresh inválido y simular Directus caído.
- Dos pestañas renovando; refresh simultáneo con logout; respuestas fuera de orden.
- Cambio de usuario en el mismo navegador y navegación atrás: sin datos privados residuales.
- POST desde otro origen y manipulación del destino de retorno: rechazados.
- PDF con texto largo, caracteres españoles y todas las básculas; tratar por separado báscula inactiva pero válida, parte archivada vinculada, parte/client/scale faltantes y scale reasignada a otro cliente. Parte archivada sigue visible y puede cambiarse en draft; no es nueva seleccionable. Relación rota bloquea edición/PDF hasta reparación válida, sin cascada silenciosa.
- Probar reparación de referencia por personal con permiso efectivo incluso no-draft, sin permitir edición general no-draft; parte pagada sustituida requiere compensar viejo retiro y debitar sustituta con stock disponible. Falta de permiso o stock mantiene bloqueo. Cambiar receptor exige nueva firma cliente; cambiar técnico, firma técnica; cliente pagado sustituido, ambas; báscula bajo mismo cliente no requiere re-firma. SignaturePad local download no equivale a upload Directus. Mostrar la imagen de la firma actual y solo el nombre del firmante inmediatamente anterior, nunca su imagen; usar el texto exacto «Anteriormente se habia firmado por: » con estilo pequeño muted y atribución correcta. Cambio real de firmante requiere nueva firma. Persistencia de nombres previos es propuesta mínima pendiente de confirmar con metadatos; no asumir campos/revisions existentes.
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
- Verificación global completa, lint, build y comprobación en navegador: no realizadas en esta actualización. Cuatro pruebas enfocadas del `DateRangePicker` pasaron en una ejecución previa; un typecheck previo falló por módulos `pdf-theme` ausentes. No hay resultado global completo ni build fresco.

En la investigación inicial funcionó CodeGraph; la revisión posterior lo contrastó con Git y lecturas locales (757 archivos indexados, con advertencia de algún vínculo pendiente de sincronización). Directus Documentation MCP aportó documentación pública; **Directus MCP**, autorizado posteriormente por el usuario para investigar el esquema, aportó metadatos vivos mediante `schema`, `fields`, `relations` y `collections`, siempre en modo lectura. Ninguno de esos metadatos prueba los permisos de las cuentas de empleados.

### Estado de decisiones y pendientes

### Decisiones de producto confirmadas

`cancelled → paid` directo sí está permitido; ya se resolvieron descuentos, obligación de precio y borrado por personal. También están cerradas las reglas de estados, reparaciones, movimientos, firmas, monetización, PDF y referencias descritas en §3.9. La composición dashboard/sidebar, vistas, pestañas, búsqueda/paginación, catálogos, perfil y preferencias de §§3.6–3.8 se confirmaron en esta sesión.

### Decisiones confirmadas: movimientos y permisos

Todo `entry` requiere proveedor real y todo `withdrawal` requiere cliente real, sin excepciones por `status`; `entry/status=loan` requiere supplier y `withdrawal/status=returned` requiere client, no supplier. Un `withdrawal` independiente por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real se bloquea. No inventar identidades ni presumir vínculo entre entrega y devolución de préstamo. Un movimiento independiente puede crearse sin orden por personal con permiso efectivo de creación; no requiere permiso de pago y su enlace a orden permanece vacío. Para pagar una orden que requiera movimientos deben coexistir permisos efectivos de pago de orden y creación de movimientos; la ausencia de cualquiera rechaza el pago completo sin efectos parciales. Si el pago no necesita crear movimientos, no hace falta permiso de creación no utilizado. La metadata condicional de Studio no demuestra enforcement API. El usuario difiere expresamente para más adelante las pruebas aisladas API y la prueba de enforcement server-side; siguen pendientes, no realizadas.

### Próximo trabajo: validación técnica, con autorización correspondiente

1. Diseñar/probar vínculo orden↔movimiento, baseline confirmado, detección de edición/borrado, compensación, atomicidad, idempotencia, concurrencia y desbloqueo automático; verificar permisos efectivos de Directus/Flow y no eludirlos. Para pagar con movimientos, exigir los permisos efectivos de pago y creación; para movimientos independientes sin orden, solo el permiso efectivo de creación.
2. Probar stock entero/no negativo y rechazo íntegro ante insuficiencia o falta de cualquiera de los permisos requeridos, incluida sustitución de parte pagada. No exigir permiso de creación en pagos que no necesiten movimientos.
3. Resolver técnicamente historial/nombre de firmantes previos y acceso a firmas, carga real de SignaturePad a Directus, selección de esquema/redondeo monetario y validar renderizado PDF en navegador; Route Handler solo ante limitación medida. No afirmar que revisions conservan archivos accesibles.
4. Verificar permisos efectivos, API enforcement, versión/configuración Directus y sesión solo con autorización específica. Las pruebas de escritura API/enforcement están expresamente diferidas por el usuario para una continuación posterior; no presentarlas como realizadas. No consultar datos/usuarios/políticas ni editar Directus.
5. Sesión `json` vs `session` y MFA requieren validación técnica; browser es la propuesta preferida de PDF, pero renderizado/preview deben probarse. Preview local puede reflejar ediciones no guardadas, nunca ser fuente de descarga. Histórico PDF inmutable no está acordado.
6. En una continuación autorizada, implementar y probar enforcement server-side de la regla resuelta: `entry` requiere supplier real y `withdrawal` requiere client real, cualquiera que sea `status`; rechazo de retiros independientes `damaged`/`decommissioned` sin cliente real; y permisos efectivos combinados para pago con movimientos. Las pruebas de API aisladas —expresamente diferidas, no realizadas— deben cubrir cambio de tipo en update, relación ausente/null, tipo inválido, pago con falta de cada permiso y creación independiente sin orden; incluir cliente derivado de una orden vinculada cuando aplique, sin inventar reglas adicionales. La lista general de movimientos vinculados ya es read-only; edición/corrección desde detalle de orden.

No se autoriza implementar código ni modificar esquema, datos, políticas o Flows. Flow dedicado de orden sigue sin decisión ni autorización. El cambio previo del Flow activo de cantidad fue autorizado, aplicado y leído de vuelta; la prueba satisfactoria reportada por el usuario no sustituye evidencia de logs/stock ni pruebas independientes.

La autorización anterior de MCP cubrió metadatos de esquema y lectura/actualización autorizada del Flow existente. Esta edición documental no crea ni modifica nada en Directus. Distinguir la regla confirmada de cliente/proveedor por tipo, la configuración de Studio y el enforcement API todavía no probado.

### Restricciones que se mantienen

- Autenticación y sesiones únicamente con Next.js y el SDK oficial de Directus; sin Better Auth, Auth.js, iron-session u otras bibliotecas externas de autenticación.
- Reutilizar dependencias de PDF y componentes pdfcn instalados, sin asumir disponibilidad de todo el catálogo.
- Reutilizar componentes y patrones existentes; sin funcionalidades ni abstracciones especulativas.
- No sacrificar seguridad, autorización, manejo de errores ni accesibilidad.
- Sin registro público de usuarios.
- Sin Gotenberg mientras no exista una limitación concreta que lo justifique.
- Sin build en esta tarea.
- La autorización de lectura de metadatos del esquema y actualización puntual del Flow de cantidad ya fue ejercida. No implica autorización para más cambios de Directus. Para acceder a datos, usuarios, políticas, credenciales o sesiones se requiere autorización explícita para ese alcance; nunca leer ni mostrar secretos.

**Riesgo principal:** permisos y sesión, integridad cliente-básculas, stock, enforcement API de cliente/proveedor e idempotencia/concurrencia de movimientos. Deben comprobarse con usuarios distintos y datos aislados antes de habilitar operaciones privadas. La ubicación de edición de movimientos vinculados ya está resuelta.

## 7. Prompt para retomar en otro equipo

Copiar este bloque en una sesión nueva **con acceso al repositorio**. El plan viaja con el proyecto; la imagen original `C:\Users\benog\Downloads\order.jpg` y las capturas `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 140321.png` y `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 143437.png` están fuera del repo y pueden no existir en el otro equipo. Son referencias visuales; volver a pedirlas solo si hacen falta.

```text
Quiero continuar la planificación del área privada de metrología.

## Instrucciones y límites
- Leé primero AGENTS.md, las reglas `.cursor/rules` aplicables y `docs/plans/area-privada-metrologia.md` completo. El plan separado de errores/logger es `docs/plans/directus-errors-logger.md` y se implementará por separado.
- Revisá el estado actual del repositorio y no sobrescribas cambios ajenos.
- Esta es una conversación de diseño. No implementes código ni cambios de Directus sin autorización específica posterior. No crees/modifiques campos o Flows; no consultes registros, usuarios, políticas, archivos privados ni secretos sin autorización específica.
- Podés proponer consultas de metadatos de esquema si hacen falta; preguntá primero si el alcance de acceso no está claro. No supongas permisos efectivos por el esquema.

## Decisiones confirmadas: documentos, auth y relaciones
- El contenido de cualquier documento solo se edita en `draft`; desde cualquier otro estado se puede volver explícitamente a `draft` con permiso. Esto no implica que `traceable`/`accredited` tengan campo `status`.
- Next.js + SDK oficial de Directus, sesiones individuales y permisos efectivos; el usuario administra políticas. Sin registro público.
- Login/logout/refresh son Server Actions POST separadas en `services/domain/server/auth/{login,logout,refresh}.ts`, cada módulo con `"use server"`, siguiendo `services/domain/server/form/submit-form.ts`. No hay Route Handlers por colección ni autenticación duplicada. Login valida credenciales e ingreso; refresh/logout validan sesión. Aplicar protección CSRF/origen y MFA cuando corresponda, con errores redactados; nunca aceptar autoridad del navegador. Compartir solo helper por solicitud si realmente hace falta.
- El modo `json` vs `session` sigue sin elegirse hasta probar despliegue y concurrencia.
- CRUD de órdenes y colecciones útiles (clientes, básculas, inventario, movimientos, etc.). `scales` son básculas de clientes, no `inventory.type = equipments`.
- Hace falta `scales.client → clients`, relación nullable propuesta y aún no creada; básculas sin cliente no aparecen. No inferir dueños anteriores. Si cambia el cliente de una orden, conservar selecciones incompatibles señaladas y bloquear guardado/PDF válido hasta resolverlas; revalidar en servidor.

## UI confirmada: shell y listados
- Entrada privada en dashboard (no listado directo), tema oscuro fijo y sidebar izquierda, filtrada por permisos efectivos: Operación (Órdenes, Movimientos) y Catálogos (Clientes, Básculas, Inventario, Marcas, Modelos, Proveedores).
- Órdenes: tabs Todas/Borradores/Pagadas/Canceladas, default Todas; `date_created DESC`; vistas tabla/lista con estado en URL vía nuqs (sin `view`: tabla desktop/lista móvil; URL única fuente, no localStorage). Búsqueda por folio o nombre de cliente (nunca RFC) sobre todo el conjunto autorizado; paginación.
- Filtros, búsqueda, tab, página y vista usan URL. Los filtros ponen página 1; cambiar tab conserva búsqueda/fechas y pone página 1. Fechas de orden por día calendario `America/Mexico_City`, sin depender del timezone del dispositivo.
- Sin métricas, precios ni acciones rápidas en filas. «Requiere corrección» es indicador, no estado. La búsqueda remota del conjunto autorizado aún debe diseñarse: Fuse y DataTable no resuelven por sí solos páginas remotas.
- Movimientos y catálogos tienen listado tabla únicamente. Clientes/Básculas/Inventario usan detalle completo; Marcas/Modelos/Proveedores, diálogos breves. El detalle de Movimiento muestra artículo, cantidad, tipo y efecto en stock. Movimiento correctivo nuevo se inicia en detalle de orden con vínculo fijo/read-only; formulario general crea sin vínculo; Flows pueden generar vinculados.

## Cuenta y preferencias
- Footer del sidebar: nombre/email/avatar privado autorizado desde Directus, solo de presentación; nunca usar token público para el asset. Menú solo Configuración/Cerrar sesión.
- Configuración tiene sidebar propia Apariencia/Perfil. Apariencia: tamaño de fuente Pequeño/Predeterminado/Grande y reducir movimiento, ambos solo por dispositivo; respetar preferencia del sistema antes de elección local. Sin selector de tema.
- Perfil: nombre, apellido, email y título; solo nombre/apellido/título editables. Email y avatar read-only; sin contraseña ni rol.
- Las capturas externas `C:\Users\benog\Downloads\Captura de pantalla 2026-11-04 140321.png` y `...143437.png` muestran colocación/composición, no características de producto, y pueden faltar en el otro equipo.

## Estado y transiciones de órdenes
- El usuario informó que no había órdenes en ese momento; no se verificó leyendo registros. `order.status` ya existe: `draft`, `paid`, `cancelled`, default `draft`, NOT NULL.
- Transiciones permitidas: `draft → cancelled`, `cancelled → draft`, `cancelled → paid` directamente, `draft → paid`, `paid → draft` y `paid → cancelled`. No volver a preguntar si `cancelled → paid` está permitido.
- `draft → paid` confirma pago; no se requieren fecha/monto/método. `paid → draft` conserva movimientos del último pago confirmado; repagar concilia delta. `paid → cancelled` compensa neto. `cancelled → paid` reconcilia desde el neto realmente atribuido.
- El historial de cancelaciones existe según el usuario; no crear historia duplicada ni asumir retención. Esta conversación no autoriza cambios de Directus.

## Datos y precios de órdenes
- `order.folio` es UUID. Todo guardado, en cualquier estado, requiere todos los campos marcados como obligatorios, ambas firmas y al menos una báscula; puede tener cero refacciones. UI/metadata no prueba enforcement de API.
- `description` es un único texto general de servicio para todas las básculas; `order.date_created` es la fecha impresa; receptor y departamento se capturan manualmente en campos existentes.
- Una línea por artículo es un modelo propuesto aún no creado; cantidad entera positiva. `draft` no reserva ni descuenta. Revalidar stock al pagar y rechazar íntegramente si es insuficiente.
- `inventory.price` es decimal(10,2), nullable, default `NULL`; no es requisito para pagar ni para mostrar stock. Sin descuentos. IVA opcional de 16% se elige y persiste por orden, separado de la visibilidad por descarga. MXN, dos decimales, precio actual vivo sin snapshot; cargos manuales opcionales: mano de obra, horas extra, viáticos y otros.
- Una orden puede pagarse sin líneas, cargos ni precios. Sin partes ni cargos, subtotal y total quedan en blanco incluso al mostrar todo. Si el precio de una línea es `NULL`, importe y subtotal/IVA/total derivados quedan en blanco, nunca como suma parcial; un cargo explícito `0.00` se imprime `$0.00` si es visible. Regla técnica de redondeo pendiente.

## PDF: presentación, autorización y descarga
- Valores no monetarios disponibles visibles por defecto; todos los valores monetarios ocultos por defecto. Mostrar/ocultar cada valor por descarga —incluso los requeridos guardados, salvo el estado siempre visible— y controles grupales «mostrar todos»/«ocultar todos los precios» para unitarios, importes de línea, cuatro cargos, subtotal, IVA y total. Dejar vacías las casillas ocultas sin alterar estructura ni datos; no persistir visibilidad. Ocultar no es permiso ni representa fallos/denegaciones.
- Mostrar siempre estado discreto (Borrador/Pagada/Cancelada, copia propuesta); watermark CANCELADA opcional con `components/pdf/watermark.tsx`. Imprimir UUID completo `order.folio`, no consecutivo. Órdenes `paid`/`cancelled` también se pueden descargar como solo lectura si están íntegras y autorizadas.
- Preferir pdfcn/Forme en navegador, aún no probado. En cada descarga el servidor reautoriza y relee, con identidad del empleado, la orden guardada y archivos necesarios; envía al cliente solo datos/assets autorizados mínimos. Preview local puede mostrar cambios sin guardar con aviso, pero no sirve como fuente de descarga.
- Bloqueo, revocación, denegación o datos requeridos ausentes impiden documento parcial y preview obsoleto. No usar URLs públicas/firmadas de firmas. PDF solo en memoria, no persistido.
- Route Handler solo si pruebas medidas de WASM/bundle/memoria/transferencia/seguridad muestran una limitación concreta. La imagen `C:\Users\benog\Downloads\order.jpg` puede no transferirse; los logos están en `assets/logos/pdf`.

## Relaciones y firmas
- Una relación faltante bloquea edición/PDF hasta reparar; no descartar líneas ni asumir cascade: restaurar el original o sustituirlo por uno válido. Personal autorizado puede reparar aun fuera de draft, pero no editar contenido normal no-draft.
- Una parte archivada ya enlazada sigue visible; su cantidad puede cambiarse en draft y descuenta stock al pagar, pero no se ofrece en nuevas selecciones. Una báscula inactiva existente del mismo cliente sigue visible/pagable; si se reasigna a otro cliente, bloquear PDF.
- Cambiar receptor en el mismo cliente requiere nueva firma cliente antes de guardar/PDF; cambiar técnico, firma técnica; sustituir cliente de orden pagada, ambas firmas; sustituir báscula bajo el mismo cliente no requiere re-firma. Reemplazar parte pagada requiere compensar el retiro previo y debitar la sustituta con stock y permisos válidos.
- `SignaturePad` solo descarga local al guardar; no prueba upload a Directus. Mostrar firma actual y solo nombre del firmante inmediatamente anterior, nunca la imagen de la firma previa, con atribución correcta y el texto exacto «Anteriormente se habia firmado por: » pequeño y muted. Persistir nombres previos por firmante es una propuesta mínima pendiente de confirmar contra metadatos; no asumir campo existente ni Directus revisions.

## Esquema y evidencia remota (solo metadatos)
- Colecciones: `order`, `order_scales`, `scales`, `clients`, `inventory` e `inventory_movements`. Aún faltan `scales.client` y el vínculo `inventory_movements.order`.
- `inventory_movements.status` incluía `sold`, `reserved`, `on_hold`, `defective`, `damaged`, `returned` y `decommissioned`; el usuario añadió `loan`, verificado por MCP. `returned` significa devolución defectuosa al proveedor, no retorno de préstamo.
- `supplier` y `client` son UUID M2O a `suppliers` y `clients`. Ambos tienen metadata base `required=true`; la condición `type != entry` para supplier y `type != withdrawal` para client configura `readonly=true`, `required=false`, `hidden=true` y `clear_hidden_value_on_save=true`. Ambas columnas son nullable y tienen `meta.validation=null`; `type` ofrece `entry`/`withdrawal` y la columna también es nullable.
- La regla de UI/servidor decidida es exigir supplier en cada `entry` y client en cada `withdrawal`, cualquiera sea `status`. La metadata de Studio no prueba enforcement API.
- El Flow activo «Movimientos Inventario» maneja create/update/delete de `inventory_movements` y efectos de stock, no transiciones de order. Su validación de cantidad nueva exige entero positivo y rechaza decimal/null/booleano/arrays en create/update; deja valores legados intactos en update/delete. Readback confirmó configuración y el usuario reportó prueba satisfactoria, pero no compartió stocks/logs. Esto no demuestra atomicidad/rollback multi-write, idempotencia o concurrencia. No volver a cambiarlo sin autorización.

## Movimientos, stock y permisos
- Personal no puede borrar físicamente registros privados, incluidos movimientos; solo admin con permisos efectivos puede borrarlos excepcionalmente. Personal con permiso efectivo sí puede editar movimientos; la corrección ordinaria es compensatoria.
- Listado general: mostrar movimientos autorizados con origen/enlace; los vinculados son read-only y se editan/corrigen solo desde detalle de orden, con permiso y vínculo fijo validado en servidor. Crear desde el listado general siempre produce movimiento independiente, sin orden.
- Formulario de movimiento es una página completa con stock antes/después. Retirada nueva y cualquier edición existente requieren confirmación; entrada nueva, preview y Guardar. El servidor revalida. Tipo explícito; notas opcionales.
- Si se edita o borra excepcionalmente un movimiento atribuido, bloquear pago/cancelación/PDF hasta compensar y volver a verificar neto atribuido contra último saldo confirmado (último pago o cero tras cancelar); desbloquear al reconciliar. `paid → draft` y la edición se permiten pese a discrepancia, sin cambiar baseline; PDF, repago y cancelación siguen bloqueados. Comparar movimientos atribuidos, no stock global.
- Vínculo orden-movimiento, detección de ediciones/borrados, atomicidad, idempotencia, concurrencia y permisos efectivos requieren diseño/prueba; no son incertidumbre de negocio. Flow dedicado de orden es recomendación, no decisión/autorización.
- No se verificaron permisos reales, enforcement API, versión/configuración, refresh concurrente ni render PDF. No consultar datos, usuarios, políticas, archivos privados o secretos sin autorización específica.
- Mantener cliente público `staticToken`/caché separado del privado; no convertir errores en respuesta `[]`. `traceable`/`accredited` quedan para después; `consecutives` excluida. Plan de logger/errores: `docs/plans/directus-errors-logger.md`.

## Filtros y estado de verificación
- Clientes: buscar solo nombre (nunca RFC) y paginar. Órdenes: buscar folio/nombre de cliente (nunca RFC). Movimientos: filtrar status, origen orden/independiente, artículo, fecha y búsqueda. Inventario: tipo, disponibilidad con/sin existencia y búsqueda. Básculas: `serial_number`/`identification`, cliente y status (cliente depende de `scales.client`, aún no creada). Marcas/Modelos/Proveedores: nombre y paginación.
- Buscar en el conjunto autorizado completo, no solo la página. Nombres pueden quedar en historial, logs o enlaces; evitar RFC solo reduce exposición. En Órdenes, «Requiere corrección» filtra únicamente referencias faltantes confirmadas o discrepancia atribuida. «No se pudo verificar» indica permiso insuficiente, no corrupción ni filtro. Con integridad desconocida, no generar PDF/transición ni revelar detalles no autorizados.
- DateRangePicker: modos excluyentes «Período» (el primer día aplica de inmediato; el segundo amplía a rango inclusivo) y «Días específicos» (días discretos). `DateRangePicker.tsx` y su test son avance enfocado, todavía no integrado en la ruta de órdenes.
- Cuatro pruebas enfocadas pasaron en una ejecución anterior; un typecheck anterior falló por módulos `pdf-theme` ausentes. No hay verificación global completa ni resultado actual de lint/formatter ni build fresco.

## Reglas de movimientos confirmadas
- Todo `type = entry` requiere proveedor real (`supplier`) y todo `type = withdrawal` requiere cliente real (`client`), cualquiera que sea `status`. Por tanto, `entry/status=loan` requiere supplier y `withdrawal/status=returned` requiere client.
- Rechazar `withdrawal` independiente por pérdida interna o baja (`damaged`/`decommissioned`) sin cliente real. No inventar identidades ni inferir emparejamiento de entrega/devolución de préstamo.
- Movimiento independiente sin orden: requiere permiso efectivo de creación, no permiso de pago, y mantiene vínculo vacío. Un pago que necesite crear movimientos exige permisos efectivos de pago de orden y creación de movimientos; si falta cualquiera, rechazar sin efectos parciales en stock/estado/visibilidad. Si no se crea movimiento, no exigir permiso de creación no utilizado.
- Metadata de Studio no demuestra enforcement API. El usuario difiere expresamente las pruebas aisladas de API y el enforcement server-side; no se han realizado.

## Validaciones técnicas pendientes (requieren autorización)
- En una continuación autorizada, probar API aislada con cambio de tipo en update, relación ausente/null, tipo inválido y cliente derivado de orden vinculada cuando aplique; no inventar reglas adicionales. También probar pago con falta de cada permiso, pago sin movimientos y creación independiente sin orden.
- Siguen sin verificarse vínculo/detección/reconciliación, atomicidad/idempotencia/concurrencia, referencias e historial de firmas, redondeo y autorización/render PDF.
- El usuario confirmó que Studio/API debe aplicar las mismas validaciones/efectos a `order.status` que Next.js y bloquear contenido no-draft en `order_scales`/futuras líneas salvo reparación autorizada. Filter/Throw Error de Directus no prueba atomicidad multi-write/concurrencia en esta instancia.
- Preferencia: Flows primero; extensiones solo si Flows no pueden demostrar atomicidad/idempotencia/concurrencia. No crear Flow dedicado sin autorización. La actualización previa del Flow de cantidad fue autorizada y aplicada; no autoriza más cambios.
- No consultar registros, usuarios, políticas, archivos privados o secretos ni modificar Directus o implementar código sin autorización específica. Actualiza el plan solo si el usuario vuelve a autorizar edición documental.
```
