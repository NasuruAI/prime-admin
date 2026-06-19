import { AuditLog } from "@/features/admin/audit-log";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Audit log" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Audit log"
      />
      <AuditLog />
    </div>
  );
}
