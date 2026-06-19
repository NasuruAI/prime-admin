import { PaymentsEditor } from "@/features/admin/payments-editor";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Payments" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Choose your gateway, add your keys, copy the webhook URL into the provider dashboard, and test the connection."
      />
      <PaymentsEditor />
    </div>
  );
}
