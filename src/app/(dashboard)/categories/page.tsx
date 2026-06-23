import { CategoriesAdmin } from "@/features/admin/categories-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Categories" };

export default function Page() {
  return (
    <div>
      <PageHeader eyebrow="Catalog" title="Categories" />
      <CategoriesAdmin />
    </div>
  );
}
