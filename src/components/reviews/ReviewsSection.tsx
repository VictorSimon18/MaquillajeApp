"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StarRating } from "./StarRating";
import { StarRatingInput } from "./StarRatingInput";
import { upsertReview } from "@/lib/actions/reviews";
import type { ReviewsSummary } from "@/lib/data/reviews";

const dateFormatter = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });

export function ReviewsSection({
  catalogProductId,
  productId,
  summary,
}: {
  catalogProductId: string;
  productId: string;
  summary: ReviewsSummary;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(summary.myReview?.rating ?? 0);
  const [comment, setComment] = useState(summary.myReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (rating < 1) {
      setError("Elige al menos una estrella.");
      return;
    }

    setSubmitting(true);
    const result = await upsertReview(catalogProductId, productId, rating, comment);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {summary.averageRating !== null ? (
          <>
            <StarRating rating={summary.averageRating} size={18} />
            <p className="text-sm font-semibold text-ink">
              {summary.averageRating.toFixed(1)}{" "}
              <span className="font-normal text-ink-muted">
                · {summary.totalCount} {summary.totalCount === 1 ? "reseña" : "reseñas"}
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-muted">Sé el primero en dejar una reseña.</p>
        )}
      </div>

      {editing ? (
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-bold text-ink">
            {summary.myReview ? "Edita tu reseña" : "Deja tu reseña"}
          </p>
          <StarRatingInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuenta tu experiencia con el producto (opcional)"
            rows={3}
            className="input-field resize-none"
          />
          {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setRating(summary.myReview?.rating ?? 0);
                setComment(summary.myReview?.comment ?? "");
                setError(null);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Guardando..." : "Guardar reseña"}
            </Button>
          </div>
        </Card>
      ) : summary.myReview ? (
        <Card className="flex flex-col gap-2 !bg-secondary-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Tu reseña
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-bold text-secondary active:scale-95"
            >
              <Pencil size={13} />
              Editar
            </button>
          </div>
          <StarRating rating={summary.myReview.rating} />
          {summary.myReview.comment ? (
            <p className="text-sm text-ink-soft">{summary.myReview.comment}</p>
          ) : null}
        </Card>
      ) : (
        <Button type="button" variant="primary" className="w-full" onClick={() => setEditing(true)}>
          <Plus size={16} />
          Añadir reseña
        </Button>
      )}

      {summary.reviews.length === 0 ? (
        summary.totalCount === 0 ? null : (
          <p className="text-sm text-ink-muted">Nadie más ha dejado reseña todavía.</p>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {summary.reviews.map((review) => (
            <Card key={review.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">{review.profile.username}</p>
                <p className="text-xs text-ink-muted">{dateFormatter.format(new Date(review.created_at))}</p>
              </div>
              <StarRating rating={review.rating} />
              {review.comment ? (
                <p className="text-sm text-ink-soft">{review.comment}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
