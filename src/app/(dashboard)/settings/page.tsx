import { SettingsEditor } from "@/features/admin/settings-editor";

export const metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-ink">Store settings</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Changes take effect immediately on the storefront and are recorded in
        the audit log.
      </p>
      <SettingsEditor />
    </div>
  );
}
