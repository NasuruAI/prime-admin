import { AuditLog } from "@/features/admin/audit-log";

export const metadata = { title: "Audit log" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Audit log</h1>
      <AuditLog />
    </div>
  );
}
