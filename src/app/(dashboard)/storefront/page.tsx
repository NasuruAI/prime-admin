import { HeroEditor } from "@/features/admin/hero-editor";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Storefront" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Appearance"
        title="Storefront"
        description="Control the homepage hero — text, background, and side images."
      />
      <HeroEditor />
    </div>
  );
}
