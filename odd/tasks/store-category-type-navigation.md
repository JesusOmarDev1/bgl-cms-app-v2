# Store category/type navigation
Feature: Add category → type → product navigation to the storefront.
Implementation route: writer; commits pending.

## Specs

- S1. The original authorization was: “Dale vamos a implementarlo todo de una vez pero primero antes de hacerlo quiero saber como haras el diseño, porque hay varias ideas de como hacer esto y muchas paginas de basculas que ya aplican esta navegacion por niveles, por ejemplo torrey, rhino, rice lake, etcetera y quiero que busques ejemplos mas concretos y con mejor UI para evaluar y que me preguntes como lo quiero y me recomiendes mejores alternativas”. This records the original request to evaluate concrete design examples and ask for the user's direction before implementation.
- S2. The user selected “Opcion A”. Recorded decision (not an expanded quotation): category → type → products; each type belongs to a single category; currently untyped products remain visible; disable the manuals URL and links without deleting Directus data; use photo-leading cards.
- S3. The user requested: “Quiero que utilices las skills de UI para pensar mejor como lo haras y asi tener algun diseño mas moderno utilizando shadcn ui”.
- S4. The user specified: “1.- Para las fotos vas a utilizar @components/shared/assets/img/DirectusImage.tsx”.
- S5. The user specified: “2.- El toolbar lo vamos a cambiar para hacerlo mas generico y que acepte ahora si otro tipo de filtros porque en realidad ya se ha seleccionado el tipo y categoria y ya lo resuelve el breadcrumb asi que no hace falta mostrarlo en un selector o un combobox, sino que hay entrarian otro tipo de valores para el filtrado, por ejemplo "capacity", "division", "brand", etcetera. Aunque claro vamos a dejar el buscador eso si se queda y el combobox para ordenar por el mas reciente, y por orden alfabetico.”
- S6. The user specified: “3.- Para los Skeleton si sera necesario que hagas componentes y subcomponentes para facilitar la creacion de sus variantes siguiendo los patrones ya implementados, por ejemplo "ProductCard.tsx" y su variante "ProductCardSkeleton.tsx" utilizando @components/ui/skeleton.tsx”.
- S7. The user confirmed: “Y sobre tu pregunta, la direccion es la adecuada solo ten en cuenta estas revisiones”.
- S8. The user clarified: “Las categorias que no tienen productos aun, es porque todavia no se añaden pero se añadiran poco a poco yo me encargare de hacerlo”.
- S9. The user requested: “Deberiamos agregar tipos de productos para la coleccion asi cumpliria los 3 niveles”.
- S10. The user specified: “La ruta /manuales y la coleccion "manuals" no le hagas caso, vamos a deshabilitarla por el momento.”

## Tasks

- T1 — S2, S9 — Add the Directus product-types schema and image support; route: writer; commit: pending.
- T2 — S2–S8 — Implement storefront category → type → product navigation, photo-leading cards, reusable filtered toolbar, skeleton variants, tests, and docs; route: writer; commit: pending.
- T3 — S2, S10 — Disable the manuals route and links without deleting Directus data, with tests; route: writer; commit: pending.

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
