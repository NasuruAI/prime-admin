import { HeroEditor } from "@/features/admin/hero-editor";

export const metadata = { title: "Storefront" };

export default function StorefrontPage() {
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">
        Storefront
      </h1>
      <p className="mb-6 text-sm text-ink/55">
        Control the homepage hero — text, background, and side images.
      </p>
      <HeroEditor />
    </div>
  );
}
