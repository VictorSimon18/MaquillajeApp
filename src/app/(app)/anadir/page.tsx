import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { getCategories } from "@/lib/data/categories";
import { getOccasions } from "@/lib/data/occasions";

export default async function AddProductPage() {
  const [categories, occasions] = await Promise.all([getCategories(), getOccasions()]);

  return (
    <div className="pt-1">
      <PageHeader title="Añadir producto" subtitle="Guarda un nuevo producto en tu armario" />
      <ProductForm mode="create" categories={categories} occasions={occasions} />
    </div>
  );
}
