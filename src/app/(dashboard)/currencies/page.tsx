import { CurrenciesAdmin } from "@/features/admin/currencies-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Currencies" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Money"
        title="Currencies"
      />
      <CurrenciesAdmin />
    </div>
  );
}
