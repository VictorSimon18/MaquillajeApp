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
  /** Producto de catálogo del que proviene, si se añadió desde ahí (null si se creó a mano). */
  catalog_product_id: string | null;
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
  /** Solo se rellena para productos importados con datos reales de caducidad (ver scripts/import-openbeautyfacts.ts); si es null, la app usa el valor por defecto de la categoría. */
  shelf_life_days: number | null;
  popularity_rank: number;
}

export interface CatalogProductWithCategory extends CatalogProduct {
  category: Category;
}

export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface Review {
  id: string;
  catalog_product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithProfile extends Review {
  profile: Profile;
}

export interface CatalogRating {
  average: number;
  count: number;
}
