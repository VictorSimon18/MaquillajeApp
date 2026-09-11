import { TriangleAlert } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import type { DuplicateMatch } from "@/lib/actions/products";

export function DuplicateWarning({
  duplicate,
  onReview,
  onConfirmAnyway,
}: {
  duplicate: DuplicateMatch;
  onReview: () => void;
  onConfirmAnyway: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3 !bg-amber-soft">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber" strokeWidth={2.25} />
        <p className="text-sm font-semibold text-ink">
          Ya tienes un producto parecido: {duplicate.name} ({duplicate.brand}
          {duplicate.shade ? ` · ${duplicate.shade}` : ""}).
        </p>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={onReview}>
          Revisar
        </Button>
        <Button type="button" variant="primary" className="flex-1" onClick={onConfirmAnyway}>
          Guardar igualmente
        </Button>
      </div>
    </Card>
  );
}
