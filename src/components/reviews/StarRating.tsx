import { Star } from "lucide-react";

/** Estrellas de solo lectura, para mostrar una puntuación ya dada. */
export function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          className={n <= Math.round(rating) ? "text-amber" : "text-line"}
          strokeWidth={1.75}
        />
      ))}
    </div>
  );
}
