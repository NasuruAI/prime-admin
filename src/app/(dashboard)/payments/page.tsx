import { PaymentsEditor } from "@/features/admin/payments-editor";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">Payments</h1>
      <p className="mb-6 text-sm text-ink/55">
        Choose your gateway, add your keys, copy the webhook URL into the
        provider dashboard, and test the connection.
      </p>
      <PaymentsEditor />
    </div>
  );
}
