import Link from "next/link";

import { CatalogBrowser } from "@/features/admin/catalog-browser";
import { adminFetch } from "@/lib/admin";
import type { AdminProduct, Paginated } from "@/types/catalog";

export const metadata = { title: "Catalog" };

export default async function AdminCatalogPage() {
  const data = await adminFetch<Paginated<AdminProduct>>(
    "/admin/catalog/products/",
  );
  const products = data.results;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-2xl font-bold text-ink">
            Catalog
          </h1>
          <p className="text-sm text-ink/55">
            {products.length} product{products.length === 1 ? "" : "s"} · click
            a product to view &amp; edit.
          </p>
        </div>
        <Link
          href="/catalog/new"
          className="inline-flex h-9 shrink-0 items-center bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          + New product
        </Link>
      </div>

      <CatalogBrowser products={products} />
    </div>
  );
}
