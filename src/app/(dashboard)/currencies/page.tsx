import { CurrenciesAdmin } from "@/features/admin/currencies-admin";

export const metadata = { title: "Currencies" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Currencies</h1>
      <CurrenciesAdmin />
    </div>
  );
}
