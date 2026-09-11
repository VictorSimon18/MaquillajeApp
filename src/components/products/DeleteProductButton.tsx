"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteProduct } from "@/lib/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="ghost" className="flex-1" onClick={() => setConfirming(true)}>
        <Trash2 size={16} />
        Eliminar
      </Button>
    );
  }

  return (
    <div className="flex flex-1 gap-2">
      <Button variant="ghost" className="flex-1" onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        className="flex-1 !bg-coral !shadow-none"
        disabled={isPending}
        onClick={() => startTransition(() => deleteProduct(productId))}
      >
        {isPending ? "Eliminando..." : "Confirmar"}
      </Button>
    </div>
  );
}
