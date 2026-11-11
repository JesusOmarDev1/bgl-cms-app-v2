# Batch 1 — prueba de autenticación JSON

**Estado:** el usuario eligió `json`; este protocolo comprueba el comportamiento real en su entorno aislado, no habilita login en producción ni autoriza al asistente a acceder a Directus. Next.js y Directus usan **dominios distintos** en ese entorno. Fuente: [Batch 1 del plan](area-privada-metrologia.md#batch-1--sesión-y-cliente-directus-privado). No copiar el tutorial oficial: usa un cliente mutable y registra respuestas con tokens.

## Antes de ejecutar

1. Usá cuentas **A y B de prueba**, políticas aisladas y HTTPS. A debe poder leer su propio perfil y un recurso privado de prueba que B no pueda leer; B debe conservar acceso a otro recurso propio. No crees usuarios o políticas de producción para este experimento.
2. Desde un cliente HTTP que **no guarde ni exporte** cuerpo, cabeceras o historial con secretos (por ejemplo una colección temporal de Postman sin sincronización), configurá la URL base de Directus y las credenciales de las cuentas **fuera del repositorio**. Nunca me envíes tokens, cookies, contraseñas, respuesta JSON completa, capturas de cabeceras ni URLs que lleven `access_token`.
3. Documentá solo versión de servidor, TTL y configuración de cookies **sin valores secretos**; si la persona administradora no puede obtenerlos, anotá «no disponible». Usá sesiones distintas para cada modo y cuenta. No reutilices el token público del sitio.

## Experimento 1 — `json` (cuenta A)

- Enviá `POST /auth/login` con JSON `{ "email": "<A>", "password": "<secreto>", "mode": "json" }`. El SDK v24 envía `mode` en el cuerpo. Registrá **solo** éxito/fallo y si existen `access_token`, `refresh_token` y `expires`, nunca sus valores.
- Con el access token **solo en memoria** y `Authorization: Bearer`, llamá `GET /users/me?fields=id` y el recurso privado de prueba permitido a A; repetí para el recurso no permitido. Registrá si cada solicitud fue permitida/denegada y su código HTTP, sin IDs, cuerpos ni PII.
- Enviá `POST /auth/refresh` con `{ "mode": "json", "refresh_token": "<en memoria>" }`; usá el access token nuevo para `readMe` y comprobá si el refresh anterior se invalida. La validez de un access token anterior hasta su vencimiento se informa **por separado**.
- Enviá `POST /auth/logout` con `{ "mode": "json", "refresh_token": "<último en memoria>" }`; verificá si un refresh posterior falla. Cierre de refresh no prueba revocación inmediata de access tokens ya emitidos.

## Experimento 2 — `session` (opcional; no bloquea JSON)

- Enviá `POST /auth/login` con `{ "email": "<A>", "password": "<secreto>", "mode": "session" }` usando un **cookie jar efímero del dominio Directus**. Registrá únicamente éxito/fallo, presencia de `Set-Cookie`, atributos `HttpOnly`, `Secure`, `SameSite`, `Domain`/host-only y duración; nunca su valor.
- Desde el mismo cliente con cookie jar, comprobá `GET /users/me?fields=id` y el mismo recurso permitido/denegado. Ejecutá `POST /auth/refresh` y `POST /auth/logout` con `{ "mode": "session" }`, preservando la cookie del jar y registrando únicamente resultados y códigos.
- Al ser dominios distintos, la cookie emitida por Directus **no se envía automáticamente a Next.js**. Esta prueba de API no demuestra que Next pueda renovar o cerrar sesión mediante ella. Para considerar `session` viable falta una prueba integrada de recepción/almacenamiento bajo el dominio Next, reenvío seguro a Directus y propagación de cookies rotadas; no copiar el dominio de Directus en una cookie de otro dominio.

## Experimento 3 — aislamiento A/B y fallas

- Repetí la lectura permitida/denegada con B usando JSON; si también probaste `session`, contrastá ese resultado por separado. Verificá que una sesión de B no lea el recurso exclusivo de A y viceversa. Anónimo no debe leer ninguno. Distinguí fallo de red/Directus caído de credenciales incorrectas.
- Anotá si las cuentas requieren MFA y si el login solicita `otp`; **no** desactives MFA para que el experimento pase. No pruebes secretos reales ni publiques capturas completas.
- **Después de integrar Next.js**: repetir `readMe` y una lectura privada con A/B desde el dominio de Next, dos pestañas renovando a la vez, respuestas de refresh fuera de orden, logout concurrente, cambio A→B, navegación atrás, expiración, varias instancias y POST desde otro origen. Ninguna prueba aislada de API sustituye estos casos. Si no se demuestra renovación segura, la aplicación debe cerrar sesión al vencer el acceso y pedir nuevo login, no prometer refresh transparente.

## Formato de devolución seguro

Informá una fila textual por caso: `modo; operación; éxito/denegación/fallo; código HTTP; atributos de cookie sí/no; observación sin datos`. Ejemplo: `json; refresh; éxito; 200; no aplica; access nuevo funciona`. Adjuntá la topología de dominios **solo como «distintos»**, versión de Directus y TTL si no son confidenciales. No envíes valores de `Set-Cookie`, tokens, email de A/B, IDs, cuerpos de respuesta ni logs completos.

**Puerta:** JSON ya está elegido. El Experimento 1 y las pruebas integradas A/B del Experimento 3 siguen pendientes para demostrar comportamiento real y cerrar Batch 1; el Experimento 2 es opcional y no detiene la implementación. Sin esas pruebas, mantener Batch 1 en curso y no afirmar que el login está verificado.
