import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ArmarioClient } from "@/components/armario/ArmarioClient";

export default async function ArmarioPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="pt-1">
      <PageHeader title="Mi armario" subtitle={`${products.length} productos guardados`} />
      <ArmarioClient products={products} categories={categories} />
    </div>
  );
}
