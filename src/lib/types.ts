export type ExpiryStatus = "active" | "expiring-soon" | "expired";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  default_shelf_life_days: number;
  is_custom: boolean;
  created_at: string;
}

export interface Occasion {
  id: string;
  user_id: string | null;
  name: string;
  is_custom: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  category_id: string;
  shade: string | null;
  opened_at: string | null;
  shelf_life_days: number | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  category: Category;
  occasions: Occasion[];
  usage_count: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category_id: string;
  shade: string | null;
  default_photo_url: string | null;
  popularity_rank: number;
}

export interface CatalogProductWithCategory extends CatalogProduct {
  category: Category;
}
