# Store category/type navigation
Feature: Add category → type → product navigation to the storefront.
Implementation route: writer; commits pending.

## Specs

- S1. The original authorization was: “Dale vamos a implementarlo todo de una vez pero primero antes de hacerlo quiero saber como haras el diseño, porque hay varias ideas de como hacer esto y muchas paginas de basculas que ya aplican esta navegacion por niveles, por ejemplo torrey, rhino, rice lake, etcetera y quiero que busques ejemplos mas concretos y con mejor UI para evaluar y que me preguntes como lo quiero y me recomiendes mejores alternativas”. This records the original request to evaluate concrete design examples and ask for the user's direction before implementation.
- S2. The user selected “Opcion A”. Recorded decision (not an expanded quotation): category → type → products; each type belongs to a single category; currently untyped products remain visible; use photo-leading cards.
- S3. The user requested: “Quiero que utilices las skills de UI para pensar mejor como lo haras y asi tener algun diseño mas moderno utilizando shadcn ui”.
- S4. The user specified: “1.- Para las fotos vas a utilizar @components/shared/assets/img/DirectusImage.tsx”.
- S5. The user specified: “2.- El toolbar lo vamos a cambiar para hacerlo mas generico y que acepte ahora si otro tipo de filtros porque en realidad ya se ha seleccionado el tipo y categoria y ya lo resuelve el breadcrumb asi que no hace falta mostrarlo en un selector o un combobox, sino que hay entrarian otro tipo de valores para el filtrado, por ejemplo "capacity", "division", "brand", etcetera. Aunque claro vamos a dejar el buscador eso si se queda y el combobox para ordenar por el mas reciente, y por orden alfabetico.”
- S6. The user specified: “3.- Para los Skeleton si sera necesario que hagas componentes y subcomponentes para facilitar la creacion de sus variantes siguiendo los patrones ya implementados, por ejemplo "ProductCard.tsx" y su variante "ProductCardSkeleton.tsx" utilizando @components/ui/skeleton.tsx”.
- S7. The user confirmed: “Y sobre tu pregunta, la direccion es la adecuada solo ten en cuenta estas revisiones”.
- S8. The user clarified: “Las categorias que no tienen productos aun, es porque todavia no se añaden pero se añadiran poco a poco yo me encargare de hacerlo”.
- S9. The user requested: “Deberiamos agregar tipos de productos para la coleccion asi cumpliria los 3 niveles”.
- S10. The user corrected the manuals decision: “1.- Cuando dije que no usariamos los manuales me refiero a que lo voy a bloquear en el backend no en el frontend, no la bloquees ni la ocultes no es necesario, elimina ese codigo.” The frontend must not block or hide `/manuales`; backend blocking is outside this frontend task.
- S11. The user specified: “2.- Tambien cuando ejecutes "pnpm pre-deploy" debes corregir los errores que aparezcan.”

## Tasks

- T1 — S2, S9 — Add the Directus product-types schema and image support; route: writer; commit: pending.
- T2 — S2–S8 — Implement storefront category → type → product navigation, photo-leading cards, reusable filtered toolbar, skeleton variants, tests, and docs; route: writer; commit: partial 5c86a30 (filters only; T2 remains incomplete).
- T3 — S2, S10 — Remove the task-created frontend suppression of `/manuales`; leave backend blocking to the backend and preserve Directus data, with tests; route: writer; commit: 9612782.
- T4 — S11 — Run `pnpm pre-deploy` and correct the errors that appear; final feature gate; route: writer; gate: passed; commit: pending.
- T5 — S11 — Apply narrowly scoped LF checkout/working-tree maintenance after T4's repo-wide Prettier gate failed; T4 gate now passed and T2 remains incomplete; route: writer; commit: 92e1a88.

## Log

- L1: Dale vamos a implementarlo todo de una vez pero primero antes de hacerlo quiero saber como haras el diseño, porque hay varias ideas de como hacer esto y muchas paginas de basculas que ya aplican esta navegacion por niveles, por ejemplo torrey, rhino, rice lake, etcetera y quiero que busques ejemplos mas concretos y con mejor UI para evaluar y que me preguntes como lo quiero y me recomiendes mejores alternativas
- L2: Opcion A
- L3: Quiero que utilices las skills de UI para pensar mejor como lo haras y asi tener algun diseño mas moderno utilizando shadcn ui
- L4: 1.- Para las fotos vas a utilizar @components/shared/assets/img/DirectusImage.tsx
- L5: 2.- El toolbar lo vamos a cambiar para hacerlo mas generico y que acepte ahora si otro tipo de filtros porque en realidad ya se ha seleccionado el tipo y categoria y ya lo resuelve el breadcrumb asi que no hace falta mostrarlo en un selector o un combobox, sino que hay entrarian otro tipo de valores para el filtrado, por ejemplo "capacity", "division", "brand", etcetera. Aunque claro vamos a dejar el buscador eso si se queda y el combobox para ordenar por el mas reciente, y por orden alfabetico.
- L6: 3.- Para los Skeleton si sera necesario que hagas componentes y subcomponentes para facilitar la creacion de sus variantes siguiendo los patrones ya implementados, por ejemplo "ProductCard.tsx" y su variante "ProductCardSkeleton.tsx" utilizando @components/ui/skeleton.tsx
- L7: Y sobre tu pregunta, la direccion es la adecuada solo ten en cuenta estas revisiones
- L8: Las categorias que no tienen productos aun, es porque todavia no se añaden pero se añadiran poco a poco yo me encargare de hacerlo
- L9: Deberiamos agregar tipos de productos para la coleccion asi cumpliria los 3 niveles
- L10: La ruta /manuales y la coleccion "manuals" no le hagas caso, vamos a deshabilitarla por el momento.
- L11: No se deben crear ni reasignar categorías o productos como parte de esta investigación.
- L12: La experiencia debe respetar el diseño oscuro actual y usar los componentes existentes.
- L13: 1.- Cuando dije que no usariamos los manuales me refiero a que lo voy a bloquear en el backend no en el frontend, no la bloquees ni la ocultes no es necesario, elimina ese codigo.
- L14: 2.- Tambien cuando ejecutes "pnpm pre-deploy" debes corregir los errores que aparezcan.
- L15: T3 frontend manuals restoration is committed as 9612782. T2 filter-toolbar work is committed as 5c86a30 and is partial; T2 skeleton variants are a follow-on implementation and do not complete T2.
- L16: This uncommitted T2 follow-on adds category, type, and product-stage skeleton fallbacks; focused rendered tests, typecheck, lint, Prettier, and diff checks pass. T2 remains incomplete and the live Directus schema remains unverified.
- L17: This uncommitted T2 navigation/card unit keeps empty categories selectable with an empty state, scopes untyped products and types to their category, adds URL/breadcrumb navigation and icon fallbacks, and uses DirectusImage for available photos. Rendered server-markup tests plus focused catalog tests (4 files, 13 tests), typecheck, ESLint, Prettier, and diff checks pass. This covers S2/S3/S4/S8; T2 remains incomplete, and live Directus hierarchy/schema plus browser navigation are unverified.
- L18: This uncommitted T2 follow-on gives published categories without slugs stable ID-backed URLs, ensures their product stage still scopes correctly, and renders invalid cross-category type URLs as the category stage rather than labeling them untyped. Rendered tests cover these URLs, category-scoped type ID mismatches, and global entry search with `q`; focused catalog tests (4 files, 18 tests), typecheck, ESLint, Prettier, and diff checks pass. T2 remains incomplete; live Directus schema/data and browser interaction are unverified.
- L19: T5 is linked to S11 because the explicitly authorized maintenance follows the final feature gate failure. `pnpm pre-deploy` reached typegen/typecheck/lint (0 errors, 35 pre-existing warnings), then failed at repo-wide Prettier with 816 files flagged before Vitest/build. Focused task files were LF and passed Prettier. At that point T4 and T2 remained incomplete.
- L20: Commit 92e1a88 enforces LF; a separate worker normalized 816 Prettier-flagged tracked files without extra Git content diff. Parent reran corrected `pnpm pre-deploy` once and it exited 0 through typegen, typecheck, ESLint (warnings only), global Prettier, Vitest unit suite, and Next build. T4's gate pass is recorded, but T1/T2 and the feature remain incomplete: Directus `product_types` and `products.product_type` are absent, and worker MCP/browser/live proof is unavailable.
