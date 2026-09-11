export type ProductCategory =
  | "labial"
  | "base"
  | "corrector"
  | "rimel"
  | "sombra"
  | "delineador"
  | "rubor"
  | "polvo"
  | "bronceador"
  | "primer";

export type ExpiryStatus = "active" | "expiring-soon" | "expired";

export type Occasion =
  | "diario"
  | "trabajo"
  | "noche"
  | "evento"
  | "finde";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  colorHex: string;
  openedDateLabel: string;
  expiryDateLabel: string;
  expiryStatus: ExpiryStatus;
  expiryText: string;
  usageCount: number;
  occasions: Occasion[];
  notes?: string;
}
