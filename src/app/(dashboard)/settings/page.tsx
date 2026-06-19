import { SettingsEditor } from "@/features/admin/settings-editor";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Changes take effect immediately on the storefront and are recorded in the audit log."
      />
      <SettingsEditor />
    </div>
  );
}
