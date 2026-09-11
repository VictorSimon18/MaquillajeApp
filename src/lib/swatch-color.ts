// Sin fotos reales todavía, cada producto recibe un color de acento
// determinista (mismo seed -> mismo color siempre) para su placeholder
// visual, en vez de un blanco/gris plano.
const PALETTE = [
  "#D6294B",
  "#7C5CFC",
  "#C9793B",
  "#14B8A6",
  "#F17E8C",
  "#B97648",
  "#3A2E52",
  "#FF5A5F",
  "#1B7F76",
  "#E8B98C",
];

export function getSwatchColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
