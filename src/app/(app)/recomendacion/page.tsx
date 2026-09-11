import { PageHeader } from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/data/products";
import { getOccasions } from "@/lib/data/occasions";
import { RecomendacionClient } from "@/components/recomendacion/RecomendacionClient";

export default async function RecomendacionPage() {
  const [products, occasions] = await Promise.all([getProducts(), getOccasions()]);

  return (
    <div className="pt-1">
      <PageHeader
        title="Recomendación"
        subtitle="Elige una ocasión y te sugerimos qué usar"
      />
      <RecomendacionClient products={products} occasions={occasions} />
    </div>
  );
}
