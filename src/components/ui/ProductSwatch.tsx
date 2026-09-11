import { createElement } from "react";
import { getCategoryIcon } from "@/lib/constants";
import { getSwatchColor } from "@/lib/swatch-color";

function hexToRgba(hex: string, alpha: number) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ProductSwatch({
  categoryName,
  seed,
  size = "md",
}: {
  categoryName: string;
  /** Identificador estable (p. ej. product.id) para un color consistente. */
  seed: string;
  size?: "sm" | "md" | "lg";
}) {
  const colorHex = getSwatchColor(seed);
  const sizes = {
    sm: { box: "h-12 w-12", icon: 18 },
    md: { box: "h-16 w-16", icon: 22 },
    lg: { box: "h-28 w-28", icon: 34 },
  }[size];

  return (
    <div
      className={`${sizes.box} shrink-0 rounded-2xl flex items-center justify-center ring-1 ring-black/5`}
      style={{
        background: `linear-gradient(145deg, ${hexToRgba(colorHex, 0.35)}, ${hexToRgba(
          colorHex,
          0.12,
        )})`,
      }}
    >
      {createElement(getCategoryIcon(categoryName), {
        size: sizes.icon,
        color: colorHex,
        strokeWidth: 2.25,
      })}
    </div>
  );
}
