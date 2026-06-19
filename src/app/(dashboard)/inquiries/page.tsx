import { InquiriesAdmin } from "@/features/admin/inquiries-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Chat orders" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Leads"
        title="Chat orders"
        description="Leads from the “Chat to order” button (Telegram, WhatsApp, Call)."
      />
      <InquiriesAdmin />
    </div>
  );
}
