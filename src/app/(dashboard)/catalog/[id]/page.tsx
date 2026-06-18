import { notFound } from "next/navigation";

import { ProductDetailEditor } from "@/features/admin/product-detail-editor";
import { adminFetch } from "@/lib/admin";
import { ApiRequestError } from "@/lib/api";
import type {
  AdminOptionType,
  AdminProduct,
  AdminVariant,
  Brand,
  Category,
  Paginated,
  ProductImage,
  StockItem,
} from "@/types/catalog";

export const metadata = { title: "Product" };

type OptionValueRow = { id: number; value: string; position: number };

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  let product: AdminProduct;
  try {
    product = await adminFetch<AdminProduct>(`/admin/catalog/products/${id}/`);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) notFound();
    throw e;
  }

  const [variants, images, categories, brands, optionTypeRows, stockList] =
    await Promise.all([
      adminFetch<Paginated<AdminVariant>>(
        `/admin/catalog/variants/?product=${id}`,
      ).then((d) => d.results),
      adminFetch<Paginated<ProductImage>>(
        `/admin/catalog/images/?product=${id}`,
      ).then((d) => d.results),
      adminFetch<Paginated<Category>>("/admin/catalog/categories/").then(
        (d) => d.results,
      ),
      adminFetch<Paginated<Brand>>("/admin/catalog/brands/").then(
        (d) => d.results,
      ),
      adminFetch<Paginated<{ id: number; name: string; position: number }>>(
        `/admin/catalog/option-types/?product=${id}`,
      ).then((d) => d.results),
      // StockAdminView returns a plain array (not paginated).
      adminFetch<StockItem[]>("/admin/inventory/stock/"),
    ]);

  // Resolve each option type's values, and a variant→on-hand stock map.
  const optionTypes: AdminOptionType[] = await Promise.all(
    optionTypeRows
      .sort((a, b) => a.position - b.position)
      .map(async (ot) => ({
        ...ot,
        values: (
          await adminFetch<Paginated<OptionValueRow>>(
            `/admin/catalog/option-values/?option_type=${ot.id}`,
          ).then((d) => d.results)
        ).sort((a, b) => a.position - b.position),
      })),
  );
  const stock: Record<string, number> = {};
  for (const s of stockList) stock[s.variant] = s.on_hand;

  return (
    <ProductDetailEditor
      product={product}
      variants={variants}
      images={images}
      categories={categories}
      brands={brands}
      optionTypes={optionTypes}
      stock={stock}
    />
  );
}
