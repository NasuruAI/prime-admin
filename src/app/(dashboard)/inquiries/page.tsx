import { InquiriesAdmin } from "@/features/admin/inquiries-admin";

export default function InquiriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Chat orders</h1>
        <p className="mt-1 text-sm text-ink/55">
          Leads from the “Chat to order” button (Telegram, WhatsApp, Call).
        </p>
      </div>
      <InquiriesAdmin />
    </div>
  );
}
