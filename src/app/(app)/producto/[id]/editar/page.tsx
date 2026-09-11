import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { getProductById } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getOccasions } from "@/lib/data/occasions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, occasions] = await Promise.all([
    getProductById(id),
    getCategories(),
    getOccasions(),
  ]);

  if (!product) notFound();

  return (
    <div className="pt-1">
      <PageHeader title="Editar producto" backHref={`/producto/${id}`} />
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        occasions={occasions}
        initialValues={{
          name: product.name,
          brand: product.brand,
          categoryId: product.category_id,
          shade: product.shade ?? "",
          openedAt: product.opened_at ?? "",
          shelfLifeDays: product.shelf_life_days ? String(product.shelf_life_days) : "",
          notes: product.notes ?? "",
          occasionIds: product.occasions.map((o) => o.id),
        }}
      />
    </div>
  );
}
