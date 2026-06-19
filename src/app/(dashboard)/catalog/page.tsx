import Link from "next/link";

import { PageHeader } from "@/components/page-header";
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
      <PageHeader
        eyebrow="Products"
        title="Catalog"
        description={`${products.length} product${products.length === 1 ? "" : "s"} · click a product to view & edit.`}
        actions={
          <Link
            href="/catalog/new"
            className="inline-flex h-9 shrink-0 items-center bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            + New product
          </Link>
        }
      />
      <CatalogBrowser products={products} />
    </div>
  );
}
