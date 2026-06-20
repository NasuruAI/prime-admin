import { ReviewsAdmin } from "@/features/admin/reviews-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Reviews" };

export default function Page() {
  return (
    <div>
      <PageHeader eyebrow="Catalog" title="Reviews" />
      <ReviewsAdmin />
    </div>
  );
}
