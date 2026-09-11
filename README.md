# Glowbox

Glowbox es un armario virtual de maquillaje: un inventario personal de productos
pensado para evitar duplicados, avisar de caducidad y sugerir qué usar según la
ocasión.

Esta fase del proyecto define la **identidad visual y la estructura de
navegación**. No hay backend, autenticación ni lógica real de caducidad o
recomendación todavía: toda la información viene de datos de ejemplo en
`src/lib/mock-data.ts`.

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/app` — páginas (App Router): inicio, armario, detalle de producto,
  añadir producto, recomendación y alertas.
- `src/components/layout` — cabecera y barra de navegación inferior.
- `src/components/ui` — componentes reutilizables (tarjeta de producto, chip
  de ocasión, badge de caducidad, etc.).
- `src/lib` — tipos, datos mock y metadatos de categorías/ocasiones.
- `src/app/globals.css` — tokens de diseño (colores, tipografías) sobre
  Tailwind CSS v4.

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react.
