"use client";

import { Star } from "lucide-react";

/** Selector de estrellas interactivo, para dejar/editar una reseña. */
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
          aria-pressed={n <= value}
          className="active:scale-90"
        >
          <Star
            size={28}
            fill={n <= value ? "currentColor" : "none"}
            className={n <= value ? "text-amber" : "text-line"}
            strokeWidth={1.75}
          />
        </button>
      ))}
    </div>
  );
}
