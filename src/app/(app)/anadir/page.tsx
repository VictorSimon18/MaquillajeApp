import { PageHeader } from "@/components/layout/PageHeader";
import { AddProductFlow } from "@/components/products/AddProductFlow";
import { getCategories } from "@/lib/data/categories";
import { getOccasions } from "@/lib/data/occasions";
import { getCatalogProducts } from "@/lib/data/catalog";
import { getCatalogRatings } from "@/lib/data/reviews";

export default async function AddProductPage() {
  const [categories, occasions, catalogProducts, ratings] = await Promise.all([
    getCategories(),
    getOccasions(),
    getCatalogProducts(),
    getCatalogRatings(),
  ]);

  return (
    <div className="pt-1">
      <PageHeader title="Añadir producto" subtitle="Busca tu producto o añádelo a mano" />
      <AddProductFlow
        categories={categories}
        occasions={occasions}
        catalogProducts={catalogProducts}
        ratings={Object.fromEntries(ratings)}
      />
    </div>
  );
}
