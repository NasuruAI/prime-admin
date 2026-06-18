import { ProductCreator } from "@/features/admin/product-creator";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">
        New product
      </h1>
      <p className="mb-6 text-sm text-ink/55">
        Create a product for the store — simple, or with options that generate
        variations.
      </p>
      <ProductCreator />
    </div>
  );
}
